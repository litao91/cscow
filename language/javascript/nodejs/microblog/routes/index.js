var User = require('../models/user.js');
var crypto = require('crypto')
module.exports = function(app) {
    // homepage
    app.get('/', function(req, res) {
        res.render('index', {
            title: 'Home Page'
        });
    });
    // load the registration form
    app.get('/reg', function(req, res) {
        res.render('reg', {
            title: 'Registration'
        });
    });
    // when user post the form
    app.post('/reg', function(req, res) {
        if (req.body['password-repeat'] != req.body['password']) {
            req.session.error = ["Password don't agree"]
            return res.redirect('/reg');
        }

        var md5 = crypto.createHash('md5');
        var password = md5.update(req.body.password).digest('base64');
        var newUser = new User({
            name: req.body.username,
            password: password
        });
        User.get(newUser.name, function(err, user) {
            if(user) {
                err = 'Username already exists.';
            }
            if(err) {
                req.session.error = [err];
                return res.redirect('/reg');
            }

            newUser.save(function(err) {
                if(err) {
                    req.session.error = [err];
                    return res.redirect('/reg');
                }
                req.session.user = newUser;
                req.session.success = ['Regsiteration success'];
                res.redirect('/');
            });
        });
    });
};
