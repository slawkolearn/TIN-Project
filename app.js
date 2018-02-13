const express = require('express');
// dla przechwytwywania parametrów wysyłanych w formularzach
const bodyParser = require('body-parser');
// dla odczytywania cookies
const cookieParser = require('cookie-parser');

const app = express();

// ustawiamy template engine dla expressa
// standardowo wszystkich tamplatesów będzie szukał w folderze 'views'
app.set('view engine', 'pug');

const mainRoutes = require('./routes');
const authenticationRoutes = require('./routes/authentication');
const testRoutes = require('./routes/tests');
const imagesUploadsRoutes = require('./routes/imagesUploads');
const loggedInUserRoutes = require('./routes/loggedInUser');

app.use(express.static('uploads'))

const portnumber = 8000;

// MIDDLEWARES

// musimy zadeklarować apce że będziemy używać funkcji middleware
// opcja w funkcji wyjaśniona tutaj: https://github.com/expressjs/body-parser
app.use(bodyParser.urlencoded( { extended: false }));
// musimy powiedzieć apce że używamy parsera cookie
app.use(cookieParser());

app.use(mainRoutes);
app.use(authenticationRoutes);
app.use('/logged', loggedInUserRoutes);
app.use(testRoutes);
app.use('/uploadImage', imagesUploadsRoutes);

// do renderowania rooutingu który nie istnieje
// TODO:SL czasami wyzwala się ten błąd samoistnie??
app.use((req, res, next) => {
    console.log("BRAK ROUTINGU !! : " + req.originalUrl);
    const err = new Error('Nie znaleziono zasobu!')
    err.status = 404;
    next(err);
});

// obsługa błędów
app.use((err, req, res, next) => {
    console.log("handling error");
    console.log("err.message : " + err.message);
    res.locals.error = err;
    res.status(err.status);
    res.render('error');
});

app.listen(portnumber, () => {
    console.log(`App is listening on localhost:${portnumber}`);
});

// TODO:SL zalogowany użytkonik może się wylogowa
// TODO:SL zaloguj/zarejestruj użytkownikać
// TODO:SL zalogowany użytkownik może dodać obrazek w site (na stronie swojego profilu)
// TODO:SL zalogowany użytkonik może przeglądać różne profile (w tym swój - osobna funkcjonalność swojego profilu)
// TODO:SL zalogowany użytkownik może likować/delikować cudze obrazki (może też pokochać ?? )
// TODO:SL nie pozwalaj dodawania niepoprawnych danych do bazy danych