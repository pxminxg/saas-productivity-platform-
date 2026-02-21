import prisma from "../prisma.js";

export const createTask = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res
        .status(401)
        .json({ message: "Not authorized (missing user id)" });
    }

    const { title, description } = req.body;

    if (typeof title !== "string" || title.trim() === "") {
      return res.status(400).json({ message: "Title is required" });
    }

    const task = await prisma.task.create({
      data: {
        title: title.trim(),
        description:
          typeof description === "string" ? description.trim() : null,
        userId: userId,
      },
    });

    return res.status(201).json(task);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const getMyTasks = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res
        .status(401)
        .json({ message: "Not authorized (missing user id)" });
    }

    const tasks = await prisma.task.findMany({
      where: { userId: userId },
      orderBy: { createdAt: "desc" },
    });

    return res.json(tasks);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const updateTask = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res
        .status(401)
        .json({ message: "Not authorized (missing user id)" });
    }

    const { id } = req.params;
    const { title, description, isCompleted } = req.body;

    // ✅ Only allow updating your own task
    const existing = await prisma.task.findFirst({
      where: { id, userId: userId },
    });

    if (!existing) {
      return res.status(404).json({ message: "Task not found" });
    }

    const dataToUpdate = {};

    if (title !== undefined) {
      if (typeof title !== "string" || title.trim() === "") {
        return res.status(400).json({ message: "Title cannot be empty" });
      }
      dataToUpdate.title = title.trim();
    }

    if (description !== undefined) {
      dataToUpdate.description =
        typeof description === "string" && description.trim() !== ""
          ? description.trim()
          : null;
    }

    if (isCompleted !== undefined) {
      if (typeof isCompleted !== "boolean") {
        return res
          .status(400)
          .json({ message: "isCompleted must be true or false" });
      }
      dataToUpdate.isCompleted = isCompleted;
    }

    const updated = await prisma.task.update({
      where: { id },
      data: dataToUpdate,
    });

    return res.json(updated);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const deleteTask = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res
        .status(401)
        .json({ message: "Not authorized (missing user id)" });
    }

    const { id } = req.params;

    const existing = await prisma.task.findFirst({
      where: { id, userId: userId },
    });

    if (!existing) {
      return res.status(404).json({ message: "Task not found" });
    }

    await prisma.task.delete({ where: { id } });

    return res.json({ message: "Task deleted" });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
