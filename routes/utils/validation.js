module.exports = {

  isAuthenticated: function(req) {
    return req.session.user_id != undefined;
  }

}
