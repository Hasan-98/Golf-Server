import { RequestHandler } from "express";
import { models } from "../models/index";

export const getAllTeams: RequestHandler = async (req, res, next) => {
  try {
    let teams = await models.Team.findAll({
      include: [
        {
          model: models.TeamMember,
          as: "members",
          attributes: [ "userId", "teamId"],
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

    teams = JSON.parse(JSON.stringify(teams))
    teams = teams.map((team: any) => {
      team.members = team.members.map((member: any) => {
        member.nickName = member.users.nickName;
        member.imageUrl = member.users.imageUrl;
        delete member.users;
        return member;
      });
      return team;
    });
      
    return res.status(200).json({ teams  });
  } catch (err) {
    console.error("Error:", err);
    return res.status(500).json({ error: "Cannot get teams at the moment" });
  }
};

export const updateTeamMember: RequestHandler = async (req, res, next) => {
  try {
    const { userId, teamId } = req.body;

    const teamMember = await models.TeamMember.findOne({
      where: {
        userId: userId,
      },
    });

    if (!teamMember) {
      return res.status(404).json({ error: "Team member not found" });
    }

    await teamMember.update({
      teamId: teamId,
    });

    return res
      .status(200)
      .json({ message: "Team member updated successfully" });
  } catch (err) {
    console.error("Error:", err);
    return res
      .status(500)
      .json({ error: "Cannot update team member at the moment" });
  }
};

export default {
  getAllTeams,
  updateTeamMember,
};
