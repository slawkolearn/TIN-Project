const express = require('express');
// dla przechwytwywania parametrów wysyłanych w formularzach
const bodyParser = require('body-parser');
// dla odczytywania cookies
const cookieParser = require('cookie-parser');

const app = express();

// ustawiamy template engine dla expressa
// standardowo wszystkich tamplatesów będzie szukał w folderze 'views'
app.set('view engine', 'pug');

const mainRoutes = require('./routes'); // bez nazwy -> defaultowo szuka pliku index ;)
const authenticationRoutes = require('./routes/authentication');
const testRoutes = require('./routes/tests');
const imagesUploadsRoutes = require('./routes/imagesUploads');
const loggedInUserRoutes = require('./routes/loggedInUser');

// ustawiamy foldery obsługiwane przez expressa i ścieżki "widziane" dla końcowych użytkowników
// dla multera
app.use(express.static('uploads'))
// dla statycznych zasobów
app.use('/static', express.static('public'));


// na tym porcie apka będzie słuchała requestów
const portnumber = 8000;

// MIDDLEWARES

// musimy zadeklarować apce że będziemy używać funkcji middleware
// opcja w funkcji wyjaśniona tutaj: https://github.com/expressjs/body-parser
app.use(bodyParser.urlencoded( { extended: false }));
// musimy powiedzieć apce że używamy parsera cookie
app.use(cookieParser());

// routing
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
// jeżeli jakiś middleware wywoła next z errorem next(error) to ten middleware zostanie wykonany
// tu po prostu wyświetlamy stronę z komunikatem o błedzie
app.use((err, req, res, next) => {
    console.log("handling error");
    console.log("err.message : " + err.message);
    res.locals.error = err;
    res.status(err.status);
    res.render('error');
});

// uruchamiamy aplikacje
app.listen(portnumber, () => {
    console.log(`App is listening on localhost:${portnumber}`);
});

// TODO:SL zalogowany użytkownik może likować/delikować cudze obrazki (może też pokochać ?? )
    // TODO:SL error : strona nie ładuję się gdy brak obrazków dla danego użytkownika
        // prawdopodobnie nie wołana funckja next() w dbCOntrollerze
// TODO:SL nie pozwalaj dodawania niepoprawnych danych do bazy danych
    // nie do końca skończone
// TODO:SL na wallu z obrazkami wyświetlaj możliwość głosowania na obrazki tylko tych na które zalogowany użytkownik nie głosował
    // ALBO daj info że już na ten obrazek głosował