
/*
 * GET home page.
 */

module.exports = function(app) {
    app.get('/', function(req, res) {
        res.render('index', {
            title: 'Home Page'
        });
    });
    app.get('/reg', function(req, res) {
        res.render('reg', {
            title: 'Registration'
        });
    });
};
