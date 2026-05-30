const jwt = require('jsonwebtoken');
const commonMiddleware = async (req, res, next) => {
    try {
        const { token } = req.cookies;

        if (!token) {
            return res.status(401).json({
                message: "Token missing"
            });
        }

        const payload = jwt.verify(
            token,
            process.env.JWT_KEY
        );

        req.result = payload;

        next();

    } catch (err) {
        return res.status(401).json({
            message: "Unauthorized"
        });
    }
};

module.exports=commonMiddleware;