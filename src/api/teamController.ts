import { RequestHandler } from "express";
import { models } from "../models/index";

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

    teams = JSON.parse(JSON.stringify(teams));
    teams = teams.map((team: any) => {
      team.members = team.members.map((member: any) => {
        member.nickName = member.users.nickName;
        member.imageUrl = member.users.imageUrl;
        delete member.users;
        return member;
      });
      return team;
    });

    return res.status(200).json({ teams });
  } catch (err) {
    console.error("Error:", err);
    return res.status(500).json({ error: "Cannot get teams at the moment" });
  }
};

export const getTeamsByEvent: RequestHandler = async (req, res, next) => {
  try {
    const { id } = req.params;

    let teams = await models.Team.findAll({
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
              attributes: ["id", "nickName", "imageUrl"],
            },
          ],
        },
      ],
    });

    teams = JSON.parse(JSON.stringify(teams));
    teams = teams.map((team: any) => {
      team.members = team.members.map((member: any) => {
        member.nickName = member.users.nickName;
        member.imageUrl = member.users.imageUrl;
        delete member.users;
        return member;
      });
      return team;
    });

    return res.status(200).json({ teams });
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

    const updatedEvent: any = await event.update({
      teamSize: teamSize,
      capacity: capacity,
    });

    let oldTeamSize = teams.length;
    const membersPerTeam = capacity;
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

export default {
  getAllTeams,
  updateTeamMember,
  getTeamsByEvent,
};
