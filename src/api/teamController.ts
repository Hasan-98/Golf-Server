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

    const event = await models.Event.findByPk(eventId);
    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }
    let updatedEvent: any = await event.update(
      {
        teamSize: teamSize,
        capacity: capacity,
      },
      {
        where: {
          id: eventId,
        },
      }
    );
    updatedEvent = JSON.parse(JSON.stringify(updatedEvent));
    const membersPerTeam = Math.floor(
      updatedEvent.capacity / updatedEvent.teamSize
    );
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
