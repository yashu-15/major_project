import express from "express";
import multer from "multer";
import Item from "../models/item.js";
import authMiddleware from "../middleware/auth.js";

const router = express.Router(); // ✅ Define the router

// ✅ Configure multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage });

// ✅ Add new item route (Authenticated User)
router.post("/add", authMiddleware, upload.single("image"), async (req, res) => {
  try {
    const { name, weight, expiryDate } = req.body;
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

    const newItem = new Item({
      userId: req.user.id,
      name,
      weight,
      expiryDate,
      imageUrl,
    });

    await newItem.save();
    res.status(201).json({ message: "Item added successfully!", item: newItem });
  } catch (error) {
    res.status(500).json({ message: "Error adding item", error });
  }
});

// ✅ Fetch all items of the logged-in user
router.get("/", authMiddleware, async (req, res) => {
  try {
    const items = await Item.find({ userId: req.user.id });

    const updatedItems = items.map((item) => {
      const today = new Date();
      const expiry = new Date(item.expiryDate);
      const diffTime = expiry - today;
      const remainingDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      return { ...item._doc, remainingDays };
    });

    res.status(200).json(updatedItems);
  } catch (error) {
    res.status(500).json({ message: "Error fetching items", error });
  }
});

// ✅ Delete item by ID (Authenticated User)
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const deletedItem = await Item.findOneAndDelete({ _id: req.params.id, userId: req.user.id });

    if (!deletedItem) {
      return res.status(404).json({ message: "Item not found or unauthorized" });
    }

    res.json({ message: "Item deleted successfully!" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting item", error });
  }
});

// ✅ Export the router (Fix the issue!)
export default router;
