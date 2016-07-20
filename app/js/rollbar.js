roll = function(msg, e, level) {
  if (e instanceof Error) {
    TraceKit.report(e, {
      level: level,
      msg: msg
    });
  } else {
    postRollbar(msg, e, level);
  }
}

TraceKit.report.subscribe(function(errorReport) {
  var extra = errorReport.extra || emo;
  postRollbar(extra.msg, errorReport, extra.level, true);
});

function postRollbar(msg, trace, level, isStack) {
  var body;
  if (isStack) {
    body = {
      trace: {
        frames: trace.stack,
        exception: {
          'class': trace.name,
          message: trace.message
        }
      }
    }
    if (msg) {
      body.trace.exception.description = msg;
    }
  } else {
    body = {
      message: {
        body: msg,
        data: trace
      }
    }
  }
  var rollbarPayload = {
    payload: {
      // platform: 'browser',
      access_token: '4a62d17b6108416eaa6da7cbb5cb9aaf',
      data: {
        client: {
          javascript: {
            browser: ua
          }
        },
        environment: 'prod',
        request: {
          url: trackingProps.context,
          user_ip: '$remote_ip'
        },
        person: {
          id: _uid
        },
        body: body,
        level: level || 'error'
      }
    }
  }

  $.ajax({
    url: 'https://api.rollbar.com/api/1/item/',
    data: stringify(rollbarPayload),
    method: 'post'
  })
}