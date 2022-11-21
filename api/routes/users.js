// We use REST API we create routes seperatly instead of (in index.js):
// app.get("/", (req, res) => {
//   res.send("Welcome to homepage");
//   });

const User = require("../models/User");
const router = require("express").Router();
const bcrypt = require("bcrypt");

// Update user 
router.put("/:id", async (req, res) => {
    // Check if the id we want to update is the same as the one in parameter (=req.params.id)
    if (req.body.userId === req.params.id || req.body.isAdmin) {
        // To update the password
        if (req.body.password) {
            try {
                const salt = await bcrypt.genSalt(10);
                req.body.password = await bcrypt.hash(req.body.password, salt);
            } catch (err) {
                return res.status(500).json(err);
            }
        }
        // To update the user
        try {
            const user = await User.findByIdAndUpdate(req.params.id, {
                // Will automatically set the input into the body
                $set: req.body,
            });
            res.status(200).json("Account has been updated");
        } catch (err) {
            return res.status(500).json(err);
        }
    } else {
        return res.status(403).json("You can update only your account!");
    }
});
// Delete user 
router.delete("/:id", async (req, res) => {
    // Check if the id we want to update is the same as the one in parameter (=req.params.id)
    if (req.body.userId === req.params.id || req.body.isAdmin) {
        // To update the user
        try {
            const user = await User.findByIdAndDelete(req.params.id);
            res.status(200).json("Account has been deleted successfully");
        } catch (err) {
            return res.status(500).json(err);
        }
    } else {
        return res.status(403).json("You can delete only your account!");
    }
});

// Get a user 
router.get("/:id", async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        // In postman we don't want all the properties about the user
        // user._doc will contain all and the first properties will be ignored
        const { password, updatedAt, ...other } = user._doc;
        res.status(200).json(other);
    } catch (error) {
        res.status(500).json(error);
    }
})

// Follow a user 
router.put("/:id/follow", async (req, res) => {
    // First we compare the id of the user who made the action and the user they want to follow. If it's the same line 86 is applied
    if (req.body.userId !== req.params.id) {
        try {
            // "user" is the user we want to follow
            const user = await User.findById(req.params.id);
            const currentUser = await User.findById(req.body.userId);

            if (!user.followers.includes(req.body.userId)) {
                await user.updateOne({ $push: { followers: req.body.userId } });
                await currentUser.updateOne({ $push: { followings: req.params.id } });
                res.status(200).json("User has been followed");
            } else {
                res.status(403).json("You already follow this user");
            }
        } catch (error) {
            res.status(500).json(error);
        }
    } else {
        res.status(403).json("You can't follow yourself !");
    }
})

// Unfollow a user 
router.put("/:id/unfollow", async (req, res) => {
    // First we compare the id of the user who made the action and the user they want to follow. If it's the same line 86 is applied
    if (req.body.userId !== req.params.id) {
        try {
            // "user" is the user we want to follow
            const user = await User.findById(req.params.id);
            const currentUser = await User.findById(req.body.userId);

            if (user.followers.includes(req.body.userId)) {
                await user.updateOne({ $pull: { followers: req.body.userId } });
                await currentUser.updateOne({ $pull: { followings: req.params.id } });
                res.status(200).json("User has been unfollowed");
            } else {
                res.status(403).json("You don't follow this user");
            }
        } catch (error) {
            res.status(500).json(error);
        }
    } else {
        res.status(403).json("You can't unfollow yourself !");
    }
})




module.exports = router;