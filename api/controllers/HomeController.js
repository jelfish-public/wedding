var Promise = require('bluebird');
var _ = require('lodash');

module.exports = {

  index: function(req, res) {
    Promise.try(function() {
      if (req.wxAccount && req.wxAccount.accountID) {
        return Promise.all([
          Promise.try(function() {
            if (req.query.state) {
              return CheckinService.checkin(req.wxAccount.accountID, req.query.state);
            } else {
              return CheckinStatus.getLastCheckinStatus(req.wxAccount.accountID);
            }
          }),
          Feeds.hasSentWish(req.wxAccount.accountID)
        ]);
      } else {
        return [];
      }
    }).then(async function(st) {
      var account = req.wxAccount || {};
      console.log(req);
      account.lastCheckin = st[0] || {};
      account.hasSentWish = st[1] || false;
      var meeting;
      var person;
      if (req.query.id) {
        meeting = await Meeting.find({where: { id: req.query.id }});
        person = await Participator.find({ where: { id: req.query.tid } });
      }
      console.log(meeting);
      meeting.weddingData = JSON.parse(meeting.wedding_data);

      return res.view('homepage', {
        account: account,
        noAbout: false,
        wedding: meeting,
        person: person,
      });
    });
  },

  attdOrNot: function(req, res) {
    console.log(req.body);
    var param = req.body;
    var value;

    if (param.attdOrNot) {
      value = {
        attend_or_not: 2,
        attend_num: param.people,
        vegetarian_or_not: param.isVege,
        others: param.others,
      };
    } else {
      value = {
        attend_or_not: 1,
      };
    }

    var result = Participator.update(value, { where: { id: req.body.tid } });

    res.json({
      code: 0,
      message: 'Success',
    })
  },

  api_checkin: function(req, res) {
    var accountID = req.param('accountID');
    var status = req.param('status');

    return CheckinService.checkin(accountID, status).then(function(checkin) {
      res.json({
        status: 'success',
        data: checkin
      });
    }, function(err) {
      console.log(err)
      res.json({
        status: 'failed',
        error: err.message
      });
    });
  },

  api_wish: function(req, res) {
    var accountID = req.param('accountID');
    var msg = req.param('msg');
    var type = req.param('type');

    Promise.try(function() {
      if (type == 'reaction') {
        return FeedService.createReactionFeed(accountID, msg);
      } else {
        return FeedService.createWishFeed(accountID, msg);
      }
    }).then(function(feed) {
      res.json({
        status: 'success',
        data: feed
      });
    }, function(err) {
      res.json({
        status: 'failed',
        error: err.message
      });
    });
  },

  api_lastFeeds: function(req, res) {
    var lastID = req.query.lastID;
    var limit = req.query.limit;

    Promise.try(function() {
      return FeedService.getLastFeeds(lastID, limit);
    }).then(function(feeds) {
      res.json({
        status: 'success',
        data: feeds
      });
    }, function(err) {
      res.json({
        status: 'failed',
        error: err.message
      });
    });
  },

  api_closeAboutUs: function(req, res) {
    res.cookie('noAbout', 1, {
      // 30days
      maxAge: 30*24*60*60*1000,
      httpOnly: true
    });
    res.json({
      status: 'success',
      data: null
    });
  },

  resolve: function(req, res, next) {
    var code = req.query.code;
    var state = req.query.state;
    if (!code) {
      return res.redirect('/home/reauth' + (state ? ('?state=' + state) : ''));
    }

    OAuthService.getClient().getAccessToken(code, function(err, token) {
      if (err || !token || !token.data || !token.data.openid) {
        return res.redirect('/home/reauth' + (state ? ('?state=' + state) : ''));
      }

      var openID = token.data && token.data.openid;

      res.cookie('openID', openID, {
        // 30days
        maxAge: 30*24*60*60*1000,
        httpOnly: true
      });

      AccountService.refreshAccountInfo(openID).then(function() {
        res.redirect(state ? ('/?state=' + state) : '/');
      }).catch(function(err) {
        next(err);
      });
    });
  },

  reauth: function(req, res, next) {
    res.view('reauth', {
      reauthUrl: OAuthService.getAuthUrl(req.query.state),
      layout: 'layout.alert'
    });
  },

  notweixin: function(req, res) {
    if (req.isWeixin) {
      return res.redirect('/');
    }
    return this.index(req, res);
  },


  wall: function(req, res) {
    res.view('wall', {

    });
  },

  api_candidate: function(req, res) {
    return AccountService.getCandidates().then(function(candidates) {
      res.json({
        status: 'success',
        data: candidates
      });
    }, function(err) {
      res.json({
        status: 'failed',
        error: err.message
      });
    });
  }
};
