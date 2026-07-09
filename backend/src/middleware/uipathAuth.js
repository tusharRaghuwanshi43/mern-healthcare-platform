// UiPath Automation API Key Authentication Middleware
// Applied only to /api/automation routes — does NOT affect normal user auth

const uipathAuth = (req, res, next) => {
    const apiKey = req.headers['x-uipath-api-key'];

    if (!apiKey) {
        return res.status(401).json({
            success: false,
            message: 'Authentication required. Missing API key.'
        });
    }

    if (!process.env.UIPATH_AUTOMATION_API_KEY) {
        console.error('UIPATH_AUTOMATION_API_KEY is not configured in environment variables.');
        return res.status(500).json({
            success: false,
            message: 'Automation service is not configured.'
        });
    }

    if (apiKey !== process.env.UIPATH_AUTOMATION_API_KEY) {
        return res.status(401).json({
            success: false,
            message: 'Invalid API key.'
        });
    }

    next();
};

module.exports = { uipathAuth };
