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

export const getAdminCategories: RequestHandler = async (
  req: any,
  res: any
) => {
  try {
    const userId = req.user.id;
    const isAdmin: any = await models.User.findOne({
      where: { id: userId },
    });

    if (isAdmin.role !== "admin") {
      return res.status(403).json({ error: "User is not an admin" });
    }

    const categories = await models.Category.findAll({
      where: {
        adminId: userId,
      },
      include: [
        {
          model: models.User,
          as: "adminDetails",
        },
        {
          model: models.User,
          as: "userDetails",
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
          as: "userDetails",
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
    for (const categoryId of categoryIds) {
      const category = await models.Category.findByPk(categoryId);
      if (!category) {
        return res
          .status(404)
          .json({ error: `Category with id ${categoryId} not found` });
      }
      await category.update({ userId: id });
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
    for (const categoryId of categoryIds) {
      const category = await models.Category.findOne({
        where: {
          id: categoryId,
          userId: id,
        },
      });
      if (!category) {
        return res.status(404).json({
          error: `Category with id ${categoryId} is not assign the user ${id}`,
        });
      }
      await models.Category.update(
        { userId: null },
        { where: { id: categoryId } }
      );
    }

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
