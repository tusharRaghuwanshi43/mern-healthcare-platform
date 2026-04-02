const User = require('../models/User');
// @desc    Get logged in user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (user) {
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                age: user.age,
                gender: user.gender,
                phone: user.phone,
                address: user.address,
                medicalNotes: user.medicalNotes,
                profilePhoto: user.profilePhoto
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        if (req.body.name && req.body.name.trim() !== "") {
            user.name = req.body.name;
        }
        if (req.body.age !== undefined) user.age = req.body.age;
        if (req.body.gender !== undefined) user.gender = req.body.gender;
        if (req.body.phone !== undefined) user.phone = req.body.phone;
        if (req.body.address !== undefined) user.address = req.body.address;
        if (req.body.medicalNotes !== undefined) user.medicalNotes = req.body.medicalNotes;

        if (req.body.password && req.body.password.trim() !== "") {
            user.password = req.body.password;
        }
        if (req.file) {
            user.profilePhoto = req.file.path;
        } else if (req.body.profilePhoto !== undefined) {
            user.profilePhoto = req.body.profilePhoto;
        }
        const updatedUser = await user.save();
        res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role,
            age: updatedUser.age,
            gender: updatedUser.gender,
            phone: updatedUser.phone,
            address: updatedUser.address,
            medicalNotes: updatedUser.medicalNotes,
            profilePhoto: updatedUser.profilePhoto
        });
    } catch (error) {
        console.error("Error updating user profile:", error);
        res.status(500).json({ message: error.message });
    }
};
// @desc    Delete user profile
// @route   DELETE /api/users/profile
// @access  Private
const deleteUserProfile = async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.user._id);
        if (user) {
            res.json({ message: 'User account deleted successfully' });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
module.exports = { getUserProfile, updateUserProfile, deleteUserProfile };