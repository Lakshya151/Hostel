const jwt = require('jsonwebtoken');

const User = require('../models/User');

const redisClient =
    require('../config/redis');

const studentMiddleware =
    async (req, res, next) => {

    try {

        const token = req.cookies?.token;

        if (!token) {

            return res.status(401).json({
                message: "Authentication required!"
            });
        }

        // check blacklist
        const isBlocked =
            await redisClient.get(
                `token:${token}`
            );

        if (isBlocked) {

            return res.status(401).json({
                message:
                    "Session expired. Please login again!"
            });
        }

        // verify token
        const payload = jwt.verify(
            token,
            process.env.JWT_KEY
        );

        const { _id, role } = payload;

        if (!_id) {

            return res.status(401).json({
                message: "Invalid token!"
            });
        }

        // allow only students
        if (role !== "student") {

            return res.status(403).json({
                message:
                    "Access denied! Students only."
            });
        }

        const result =
            await User.findById(_id);

        if (!result) {

            return res.status(404).json({
                message:
                    "Student not found!"
            });
        }

        // extra safety
        if (!result.isResident) {

            return res.status(403).json({
                message:
                    "Student is no longer active!"
            });
        }

        req.result = result;

        next();

    } catch (err) {

        return res.status(401).json({
            message: "Invalid or expired token!"
        });

    }
};

module.exports = studentMiddleware;