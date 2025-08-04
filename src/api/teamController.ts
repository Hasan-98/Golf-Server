import { RequestHandler } from "express";
import { models } from "../models/index";
import { Op } from "sequelize";

export const getAllTeams: RequestHandler = async (req, res, next) => {
  try {
    let teams = await models.Team.findAll({
      include: [
        {
          model: models.TeamMember,
          as: "members",
          attributes: ["userId", "teamId"],
          include: [
            {
              model: models.User,
              as: "users",
              attributes: ["id", "nickName", "imageUrl"],
            },
          ],
        },
      ],
    });

    let totalJoinedMembers = 0;
    teams = JSON.parse(JSON.stringify(teams));
    teams = teams.map((team: any) => {
      team.members = team.members.map((member: any) => {
        member.nickName = member.users.nickName;
        member.imageUrl = member.users.imageUrl;
        delete member.users;
        return member;
      });
      team.membersCount = team.members.length;
      totalJoinedMembers += team.membersCount;
      return team;
    });

    return res.status(200).json({ teams, totalJoinedMembers });
  } catch (err) {
    console.error("Error:", err);
    return res.status(500).json({ error: "Cannot get teams at the moment" });
  }
};

export const getTeamsByEvent: RequestHandler = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Step 1: Fetch teams and members
    let teams: any = await models.Team.findAll({
      where: {
        eventId: id,
      },
      include: [
        {
          model: models.TeamMember,
          as: "members",
          attributes: ["userId", "teamId"],
          include: [
            {
              model: models.User,
              as: "users",
              attributes: ["id", "nickName", "imageUrl", "memberFullName", "memberTelPhone", "memberEmailAddress", "memberHandicap"]
            },
          ],
        },
      ],
    });

    teams = JSON.parse(JSON.stringify(teams));

    const userIds = new Set(teams.flatMap((team: any) => team.members.map((member: any) => member.userId)));

    const userEventStatuses: any = await models.UserEvent.findAll({
      where: {
        user_id: { [Op.in]: Array.from(userIds) },
        event_id: id
      },
      attributes: ['user_id', 'status']
    });

    const statusMap = new Map(userEventStatuses.map((ue: any) => [ue.user_id, ue.status]));

    let totalJoinedMembers = 0;
    teams = teams.map((team: any) => {
      team.members = team.members.map((member: any) => {
        member.nickName = member.users.nickName;
        member.imageUrl = member.users.imageUrl;
        member.memberFullName = member.users.memberFullName;
        member.memberTelPhone = member.users.memberTelPhone;
        member.memberEmailAddress = member.users.memberEmailAddress;
        member.memberHandicap = member.users.memberHandicap;
        member.status = statusMap.get(member.userId);
        
        delete member.users;
        return member;
      });
      team.membersCount = team.members.length;
      totalJoinedMembers += team.membersCount;
      return team;
    });

    return res.status(200).json({ teams, totalJoinedMembers });
  } catch (err) {
    console.error("Error:", err);
    return res.status(500).json({ error: "Cannot get teams at the moment" });
  }
};
export const updateTeamMember: RequestHandler = async (req, res, next) => {
  try {
    const { eventId, teamSize, teams, capacity } = req.body;

    const activeMembers =
      teams.reduce((total: any, team: any) => total + team.members.length, 0) /
      teamSize;
    const reqActiveTeams =
      teams.reduce((total: any, team: any) => total + team.members.length, 0) /
      capacity;

    if (capacity < activeMembers) {
      return res.status(400).json({
        error:
          "Capacity cannot be smaller than the total number of team members ",
      });
    }

    if (teamSize < reqActiveTeams) {
      return res
        .status(400)
        .json({ error: "Teams Must have at Least " + reqActiveTeams });
    }
    const event = await models.Event.findByPk(eventId);
    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }
    const membersPerTeam = capacity / teamSize;

    const updatedEvent: any = await event.update({
      teamSize: teamSize,
      capacity: membersPerTeam,
    });

    let oldTeamSize = teams.length;
    for (let i = 0; i < teams.length; i++) {
      const team = await models.Team.findByPk(teams[i].id);
      if (team) {
        await team.update({
          membersPerTeam: membersPerTeam,
        });

        for (let j = 0; j < teams[i].members.length; j++) {
          const member = await models.TeamMember.findOne({
            where: { userId: teams[i].members[j].userId },
          });
          if (member) {
            await member.destroy();
            await models.TeamMember.create({
              userId: teams[i].members[j].userId,
              teamId: teams[i].id,
            });
          }
        }
      }
    }

    for (let i = 0; i < teams.length; i++) {
      const team = await models.Team.findByPk(teams[i].id);
      if (team) {
        await team.update({
          membersPerTeam: membersPerTeam,
        });

        if (teams[i].members.length > capacity) {
          const excessMembers = teams[i].members.length - capacity;
          for (let j = 0; j < excessMembers; j++) {
            const nextTeamIndex = (i + 1) % teams.length;
            const nextTeam = teams[nextTeamIndex];
            const memberToTransfer = teams[i].members.pop();
            await models.TeamMember.update(
              { teamId: nextTeam.id },
              { where: { userId: memberToTransfer.userId } }
            );
            nextTeam.members.push(memberToTransfer);
          }
        }
      }
    }
    const actualTeamSize = teamSize - oldTeamSize;

    if (actualTeamSize > 0) {
      for (let i = 0; i < actualTeamSize; i++) {
        const teamName = `Team ${oldTeamSize + i + 1}`;
        await models.Team.create({
          eventId: eventId,
          name: teamName,
          membersPerTeam: capacity,
        });
      }
    } else if (actualTeamSize < 0) {
      const teamsToRemove = teams.splice(actualTeamSize);
      for (const teamToRemove of teamsToRemove) {
        await models.Team.destroy({ where: { id: teamToRemove.id } });
      }
    }

    return res
      .status(200)
      .json({ message: "Teams and team members updated successfully" });
  } catch (err) {
    console.error("Error:", err);
    return res
      .status(500)
      .json({ error: "Cannot update teams and team members at the moment" });
  }
};
export const deleteTeamMember: RequestHandler = async (req, res, next) => {
  try {
    const { teamId, userId, eventId } = req.body;

    const teamMember = await models.TeamMember.findOne({
      where: {
        teamId: teamId,
        userId: userId,
      },
    });

    if (!teamMember) {
      return res.status(404).json({ error: "Team member not found" });
    }

    await teamMember.destroy();

    await models.UserEvent.update(
      { status: 'waiting' },
      {
        where: {
          user_id: userId,
          event_id: eventId
        },
      }
    );

    return res.status(200).json({ message: "Team member deleted successfully" });
  } catch (err) {
    console.error("Error:", err);
    return res.status(500).json({ error: "Cannot delete team member at the moment" });
  }
};
export const deleteWaitingUsers: RequestHandler = async (req, res, next) => {
  try {
    const { eventId, userId } = req.body;
    const waitingUsers = await models.UserEvent.findOne({
      where: {
        status: 'waiting',
        event_id: eventId,
        user_id: userId,
      },
    });

    if (!waitingUsers) {
      return res.status(404).json({ error: "No users with status 'waiting' found" });
    }

    await models.UserEvent.destroy({
      where: {
        status: 'waiting',
        event_id: eventId,
        user_id: userId,
      },
    });
    await models.TeamMember.destroy({
      where: {
        userId: userId,
      },
    });       
    return res.status(200).json({ message: "Users with status 'waiting' deleted successfully" });
  } catch (err) {
    console.error("Error:", err);
    return res.status(500).json({ error: "Cannot delete users at the moment" });
  }
};
export const getTeamById: RequestHandler = async (req, res, next) => {
  try {
    const { id } = req.params;

    const teamData = await models.Team.findOne({
      where: {
        id: id,
      },
      include: [
        {
          model: models.ScoreCard,
          as: "teamCard",
          attributes: ["id", "userId", "eventId", "scorePerShot", "handiCapPerShot", "totalScore", "handiCapValue", "netValue" , "nearPinContest" , "driverContest"],
        },
      ],
    });

    if (!teamData) {
      return res.status(404).json({ error: "Team not found" });
    }

    return res.status(200).json(teamData);
  } catch (err) {
    console.error("Error:", err);
    return res.status(500).json({ error: "Cannot get team data at the moment" });
  }
};

export default {
  getTeamById,
  getAllTeams,
  deleteTeamMember,
  updateTeamMember,
  getTeamsByEvent,
  deleteWaitingUsers,
};
