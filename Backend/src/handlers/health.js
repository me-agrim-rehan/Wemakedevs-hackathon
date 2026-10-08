//basic lembda function hai ye

exports.handler = async () => {
    return {
        statusCode: 200,
        body: JSON.stringify({
            message: "Disaster Response API is running"
        })
    };
};