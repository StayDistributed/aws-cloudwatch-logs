module.exports = function (config) {

  var cloudwatchlogs = config.cloudwatchlogs,
      logGroupName = config.logGroupName || '/aws-cloudwatch-logs/default';

  function log (eventName, message) {

    var d = new Date(),
        logStreamName = config.logStreamName || ([d.getFullYear(), d.getMonth()+1, d.getDate()].join('/') + ' ' + eventName);

    cloudwatchlogs.describeLogStreams({
      logGroupName: logGroupName,
      logStreamNamePrefix: logStreamName
    }, function (err, data) {
      if (err || !data) return;

      if (data.logStreams && data.logStreams[0]) {

        cloudwatchlogs.putLogEvents({
          logEvents: [{
            message: JSON.stringify(message),
            timestamp: (new Date).getTime()
          }],
          logGroupName: logGroupName,
          logStreamName: logStreamName,
          sequenceToken: data.logStreams[0].uploadSequenceToken
        }, function (err, data) {});

      } else {

        cloudwatchlogs.createLogStream({
          logGroupName: logGroupName,
          logStreamName: logStreamName
        }, function (err, data) {
          if (err) return;

          cloudwatchlogs.putLogEvents({
            logEvents: [{
              message: JSON.stringify(message),
              timestamp: (new Date).getTime()
            }],
            logGroupName: logGroupName,
            logStreamName: logStreamName
          }, function (err, data) {});
        });

      }

    });

  }

};
