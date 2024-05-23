const isAdminLogin = (req, res, next) => {
    if (req.session.adminId) {
      next();
    } else {
      res.redirect("/admin");
    }
  };
  
  const isAdminLogout = (req, res, next) => {
    if (!req.session.adminId) {
      next();
    } else {
      res.redirect("/admin/dashboard");
    }
  };
  
  module.exports = {
    isAdminLogin,
    isAdminLogout,
  };