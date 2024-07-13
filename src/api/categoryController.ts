import { RequestHandler } from "express";
import { models } from "../models";

export const addCategory: RequestHandler = async (
  req: any,
  res: any,
  next: any
) => {
  try {
    const userId = req.user.id;
    const { categoryName } = req.body;
    const isAdmin: any = await models.User.findOne({
      where: { id: userId },
    });

    if (isAdmin.role !== "admin") {
      return res.status(403).json({ error: "User is not an admin" });
    }

    const category = {
      categoryName,
      adminId: userId,
    };
    await models.Category.create(category);
    res.status(201).json({ message: "Category created successfully" });
  } catch (err) {
    console.error("Error:", err);
    return res
      .status(500)
      .json({ error: "Cannot create category at the moment" });
  }
};

export const getAdminCategories: RequestHandler = async (req: any, res: any) => {
  try {
    const userId = req.user.id;
    const admin = await models.User.findOne({
      where: { id: userId, role: "admin" },
    });

    if (!admin) {
      return res.status(403).json({ error: "User is not an admin" });
    }

    const categories = await models.Category.findAll({
      where: {
        adminId: userId
      },
      include: [
        {
          model: models.User,
          as: "adminDetails",
        },
        {
          model: models.User,
          as: "users",
          through: { attributes: [] },
        },
      ],
    });
    return res.status(200).json(categories);
  } catch (err) {
    console.error("Error:", err);
    return res
      .status(500)
      .json({ error: "Cannot get categories at the moment" });
  }
};

export const getAllCategories: RequestHandler = async (req: any, res: any) => {
  try {
    const categories = await models.Category.findAll({
      include: [
        {
          model: models.User,
          as: "adminDetails",
        },
        {
          model: models.User,
          as: "users",
          through: { attributes: [] },
        },
      ],
    });
    return res.status(200).json(categories);
  } catch (err) {
    console.error("Error:", err);
    return res
      .status(500)
      .json({ error: "Cannot get categories at the moment" });
  }
};

export const assignCategoriesToUser: RequestHandler = async (
  req,
  res,
  next
) => {
  try {
    const { categoryIds } = req.body;
    const { id } = req.params;

    const userExists = await models.User.findByPk(id);
    if (!userExists) {
      return res.status(404).json({ error: "User not found" });
    }
    if (!Array.isArray(categoryIds)) {
      return res.status(400).json({ error: "Invalid categoryIds format" });
    }

    const categories = await models.Category.findAll({
      where: { id: categoryIds },
    });

    if (categories.length !== categoryIds.length) {
      return res
        .status(404)
        .json({ error: "One or more categories not found" });
    }

    for (const category of categories) {
      await models.UserCategory.create({
        userId: id,
        categoryId: category.id,
      });
    }

    return res
      .status(200)
      .json({ message: "Categories assigned successfully" });
  } catch (error) {
    console.error("Error:", error);
    return res
      .status(500)
      .json({ error: "Cannot assign categories at the moment" });
  }
};
export const unassignCategoriesFromUser: RequestHandler = async (
  req,
  res,
  next
) => {
  try {
    const { categoryIds } = req.body;
    const { id } = req.params;

    const userExists = await models.User.findByPk(id);
    if (!userExists) {
      return res.status(404).json({ error: "User not found" });
    }

    if (!Array.isArray(categoryIds)) {
      return res.status(400).json({ error: "Invalid categoryIds format" });
    }

    const userCategories = await models.UserCategory.findAll({
      where: {
        userId: id,
        categoryId: categoryIds
      }
    });

    if (userCategories.length !== categoryIds.length) {
      return res.status(404).json({
        error: "One or more categories are not assigned to this user"
      });
    }

    await models.UserCategory.destroy({
      where: {
        userId: id,
        categoryId: categoryIds
      }
    });

    return res
      .status(200)
      .json({ message: "Categories unassigned successfully" });
  } catch (error) {
    console.error("Error:", error);
    return res
      .status(500)
      .json({ error: "Cannot unassign categories at the moment" });
  }
};
export default {
  addCategory,
  getAdminCategories,
  getAllCategories,
  assignCategoriesToUser,
  unassignCategoriesFromUser,
};
