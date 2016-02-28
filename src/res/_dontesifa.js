/////////////////////////////////////////////////////////////////////////////////////////////////////
// inicializálása                                                                                  //
/////////////////////////////////////////////////////////////////////////////////////////////////////
$('#ID_feladat').hide();            // A második lépés elrejtése.
$('#container-left-data').hide();  
$('#container-right-select-attributes').hide();  



var r = 12;                         // A geometriai pontok sugara
var vonalvastagsag = 5;            // A körök falának a vastagsága.
var betu_meret = 14;                // A canvas betűmérete
var betu_tipus = "Arial";           // A canvas betűtípusa
var felirat_x = 0;                  // A geometriai pont feliratának eltolása
var felirat_y = 0;                  // A geometriai pont feliratának eltolása
var container_right_width = 350;    // A jobb oldali container (klaszter összevonó) szélessége
var pontossag = 100;                // Hány helyiértékkel írja ki a számokat. log10(pontossag)

var btn = 50;                       // Zoom gomb mérete.

// állapot változók
window.aktID = null;                // Az aktuális mentett feladat ID-ja az előzményekben.
window.aktFeladatNev = null;        // Az aktuálisan kiválasztott feladat
window.aktAdat = null;              // Az aktuálisan kiválasztott geometriai feladat adatai.
window.Elozmenyek = new ElozmenyLista();    // Az előzmények tárolója.

window.offsetX = 100;                    // A canvasen lévő pontok eltolása. Egérrel változtatható.
window.offsetY = 100;

window.startx =0;                      // Kezdőpontok az egér mozgásának lekövetéséhez.
window.starty =0;

window.canvas_scale = 1;

/////////////////////////////////////////////////////////////////////////////////////////////////////
// Vezérlést végrehajtó függvények. Beleértve az adatok betöltését a feladatba.                    //
/////////////////////////////////////////////////////////////////////////////////////////////////////


/**
 * A page onload eseményének lekezelése. Adatok betöltése, s a mérethez igazítása
 */
function OldalBetoltve() {
    FeladatokBetoltese();
    OldalAtmeretezve();
    var c = document.getElementById("canvas");
    canvas.addEventListener("mousedown", doMouseDown, false);
    canvas.addEventListener("mousemove", doMouseMove, false);
    canvas.addEventListener("mouseup", doMouseUp, false);
}
 
 
 
function doMouseDown(evt) {
    window.isMouseDown = true;
    window.startx = evt.clientX;
    window.starty = evt.clientY;
    //log("Mouse down: " + startx + ":" + starty);
}

function doMouseMove(evt) {
    if (window.isMouseDown) {
        window.offsetX += (evt.clientX - window.startx) / window.canvas_scale;
        window.offsetY += (evt.clientY - window.starty) / window.canvas_scale;
        window.startx = evt.clientX;
        window.starty = evt.clientY;
        Ujrarajzolas();
    }
}
 
function doMouseUp(evt) {
    window.isMouseDown = false;
}



/**
 * Betölti az adat.js-ben és az Előzményekben található adatokat ahhoz, hogy a felhasználó kiválaszthassa a megfelelő feladatot.
 * A kattintást a FeladatKivalasztasa(<feladatnev|feladatid>,[elozmenybelie true]) függvény végzi e.
 */
function FeladatokBetoltese(){
    // Új feladatok betöltése
        var feladatok = '';
        for (var x in window.adat_dontesi_fa) {
            feladatok+= "<a href='#' class='list-group-item' onclick='FeladatKivalasztasa(";
            feladatok+= '"' + x + '"' + ")'>" + x + "</a>\n";
        }
        $("#ID_ujfeladatlista").html( feladatok != "" ? feladatok :
            "<div class='list-group-item'>Nem találhatóak feladatok a rendszerben.</div>"
        );

    // Mentett feladatok betöltése
        window.Elozmenyek.Betolt();
        feladatok = '';
        var tmp = window.Elozmenyek.GetList();
        for (var x in tmp) {
            feladatok+= "<a href='#' class='list-group-item' onclick='FeladatKivalasztasa(";
            feladatok+= '"' + tmp[x].ID + '"' + ", true)'>" + tmp[x].Nev + "<span class='badge' onclick='FeladatTorlese(event," + '"' + tmp[x].ID + '"' + ")''>X</span></a>\n";
        }
        $("#ID_mentettfeladatok").html( feladatok != "" ? feladatok :
            "<div class='list-group-item'>Nem találhatóak mentett feladatok a rendszerben.</div>"
        );
}

/**
 * Átméretezi az oldalon található elemeket, az aktuális ablakméretnek megfelelően. A canvast ilyenkor újra kell rajzolni!
 */
function OldalAtmeretezve(){
    // A containerek szélességének beálítása.
    $('#container-right').width(container_right_width);
    $('#container-left').width( $( '#ID_feladat' ).width()-container_right_width-20 );

    // A canvas átméretezése
    var canvas = document.getElementById('canvas');
    canvas.width = $('#container-left').width()-20;
    canvas.height = $('#container-left').width()-20; //Math.round(con_left.offsetHeight/2);

    Ujrarajzolas(); // szükséges mert az átméretezett canvas törlődik.
}

/**
 * Annak lekezelése, hogy a felhasználó kiválasztott egy fealdatot.
 * @param {String} selected - a kiválasztott feladat neve.
 * @param {Boolean} elozmenybelie - félbehagyott feladatot folytat az előzményből.
 */
function FeladatKivalasztasa(selected, elozmenybelie){

    //elozmenybelie = elozmenybelie || false;     // default paraméter hack
    $('#ID_kezdooldal').fadeOut( 400, function () { $('#ID_feladat').fadeIn(); });      // kezdőoldal eltüntetése

    /*
        Régi feladatot folytat.
            Állapotváltozók beállítása
            KLASZTER adatok beállítása. (Ez állapotgép!)
            Klaszter rajzolás.

        Új feladatot választott ki
            Állapotváltozók beállítása
            Adatok betöltése a megfelelő változókba
            Geometriai Rajzolás
     */
    if (elozmenybelie) {

        window.aktID = selected;
        window.aktFeladatNev = window.Elozmenyek.getNev(window.aktID);
        window.aktAdat = Array();

        var tmp = window.Elozmenyek.getLastStep(window.aktID, false, 1);

        var dontesiFa = new DontesiFa();
        dontesiFa.initTreeByLocalStorageObject(tmp);

        window.aktAdat["DontesiFa"] = dontesiFa;

    } else {

        window.aktID = null;
        window.aktFeladatNev = selected;
        window.aktAdat = Array();

        var adatMatrix = new AdatMatrix();
        var dontesiFa = new DontesiFa();

        for (var i =0; i< window.adat_dontesi_fa[selected].length; i++) {

            // data_dontesi_fa.js adatainak transzformálása. Innentől kezdve csak olyan adat van a rendszerben, ami valamilyen jól definiált osztályba tartozik.
            var adat_sor = window.adat_dontesi_fa[selected][i]  ;            
            adatMatrix.addLine(adat_sor);
        }

        dontesiFa.createGyokerCsomopont(adatMatrix);

        window.aktAdat["DontesiFa"] = dontesiFa;
        //window.aktID = Date().toLocaleString();
        window.aktID = Date().toLocaleString().slice(0,25);
        window.Elozmenyek.addItem(window.aktID, window.aktID + " - " + window.aktFeladatNev);
        window.Elozmenyek.addStep(window.aktID, window.aktAdat["DontesiFa"]);
    }

    // Az adatok megjelenítése. Ehhez be kellett állítani az állapotváltozókat.
    Ujrarajzolas();

}




/**
 * Egy mentett feladat eltávolítása az előzményekből.
 * @param {ID} FeladatID
 */
function FeladatTorlese(event, FeladatID) {
    window.Elozmenyek.deleteItem(FeladatID);
    window.Elozmenyek.Ment();
    FeladatokBetoltese();
    Ujrarajzolas();
    if (event.stopPropagation) {
        event.stopPropagation();   // W3C model
    } else {
        event.cancelBubble = true; // IE model
    }
}


/////////////////////////////////////////////////////////////////////////////////////////////////////
// Rajzolást és az adatok megjelenítését végző függvéynek                                          //
/////////////////////////////////////////////////////////////////////////////////////////////////////



/**
 * Információs szöveg kiírása a feladat közben. Segít a felhasználónak, hogy mi a következő lépés.
 * @param {String} content : A HTML formázott szöveg.
 */
function SegitoSzoveg(content) {
    $("#ID_segitoszoveg").html(content);
}

function showFejlec()
{

    var szoveg = "Jelenleg " + window.aktAdat["DontesiFa"].getAktualisCsomopontSzamNullatolSzamozva() + " db csomópontod van a döntési fában. " 
                + "A kiinduló adatmátrix " + window.aktAdat["DontesiFa"].Gyoker.TaroltTabla.SzureshezOszlopNevek.length 
                + " db attribútummal és " + window.aktAdat["DontesiFa"].Gyoker.TaroltTabla.AdatTabla.length + " db sorral rendelkezik.<br /><br />"
                + "Kérlek válassz egyet a döntési fa levelei közül és add meg az attribútumot, amely szerint szét szeretnéd osztani a (rész)tábla sorait.";

    szoveg +=    " <div class='btn btn-primary' ";
    if (! VisszavonasAktiv())
        szoveg += "disabled='disabled' ";

    szoveg += "onclick='Visszavonas()'>Visszavonás</div>";

    SegitoSzoveg( szoveg );
}


/**
 * Elvégzi a felület újrarajzolását.
 * FIGYELEM! Használja a globális állapotváltozókat.
 */
function Ujrarajzolas() {
    
    /*

        HA (aktFeladatNev== ures)
            akkor még a főoldalon vagyunk. Feladatválasztás előtt.
        KÜLÖNBEN
            HA (aktID == null)
                Még geometriai állapotban van a feladat.
            KÜLÖNBEN
                Már vannak klaszterek.
                HA (utolsolepes == null)
                    most kezdtük a klaszterezést. Segítoszoveg(Jobb oldalon lehet dolgozni)
                KÜLÖNBEN
                    Segitoszoveg(Utolsó lépés...)

     */


    if (window.aktFeladatNev == null) {
    
        SegitoSzoveg("<b>1. lépés:</b> Kérlek válaszd ki, hogy milyen adatokkal szeretnél dolgozni. Választhatsz egy korábban - ebben a böngészőben - félbehagyott feladatot, vagy újat kezdhetsz a teszt adatok valamelyikének kiválasztásával.");

    } else {

/*        if ( aktID == null ) { */

            AbrazolasGeometriaiCanvas(window.aktAdat["DontesiFa"], "#000000", true);
            AbrazolasCsomopontValasztasMuvelet(window.aktAdat["DontesiFa"]);
            showFejlec();

 /*       } else {


            console.log("aktID == else");
    / *
        3. Kirajzoljuk a klasztereket a vászonra.
        4. Kirajzoljuk a klaszterekből származó pontokat, távolságnak. (Sorrendezni kell :S)
        5. Kirajzoljuk a klaszter táblázatot is jobb oldalra.
        6. Vesszük az előzményekből az utolsó lépést. S kiírjuk, mint segítő szöveg.
    * /

            var aktklaszterek = window.Elozmenyek.getKlaszterek(window.aktID);
            AbrazolasKlaszterekCanvas(aktklaszterek);
            console.log("Ábrázolás művelet meghívása: " + window.Elozmenyek.BottomUP(window.aktID));
            AbrazolasKlaszterekMuvelet(aktklaszterek, window.Elozmenyek.BottomUP(window.aktID));

            var tmp = window.Elozmenyek.getLastStep(window.aktID);
            if (tmp == null ) {
                    SegitoSzoveg(
                        window.Elozmenyek.BottomUP(window.aktID) ?
                            "Bottom-up klaszterezés. A jobb oldalon vond össze a klasztereket." :
                            "Top-down klaszterezés, a jobb oldalon kezd el szétosztani a klasztereket."
                    );

            } else {
                SegitoSzoveg("A legutóbb elvégzett művelet: <b>" + tmp[0].ID + "</b> és a <b>" + tmp[1].ID + "</b> összevonása a <b>" + tmp[2].ID + "</b> klaszterbe. "+
                    "<div class='btn btn-primary' onclick='Visszavonas()'>Visszavonás</div>");
            }


            if (  $('#zhtablazat-euk tr').length == 0) { // Ha mentett feladatot töltöttünk be, akkor ezeket újra kell rajzolni.
                var tmp = Array();
                for (var i =0; i<aktklaszterek.length; i++) {
                    for (var j in aktklaszterek[i].elemek) {
                        tmp.push(aktklaszterek[i].elemek[j]);
                    }
                }
                AbrazolasGeometriaiZHTablazat( tmp, $('#zhtablazat-euk'), TavolsagEuklideszi );
                AbrazolasGeometriaiZHTablazat( tmp, $('#zhtablazat-xy'), TavolsagXY );
            }

        } // if aktID == null
*/
    } // if window.aktFeladatNev == null

} // function ViewFrissites



function VonalatRajzol(canvas, x1_koord, y1_koord, x2_koord, y2_koord, szuro_cimke){

    canvas.beginPath();
    canvas.moveTo( x1_koord + window.offsetX, y1_koord + window.offsetY );
    canvas.lineTo( x2_koord + window.offsetX, y2_koord + window.offsetY);
    canvas.stroke();

    var szovegSzelesseg = canvas.measureText(szuro_cimke).width;

    canvas.font = 18 + "px " + betu_tipus;
    canvas.fillStyle = '#f00';
    canvas.fillText(
        szuro_cimke,
        window.offsetX + ((x1_koord + x2_koord ) / 2) - szovegSzelesseg / 2,
        window.offsetY + ((y1_koord + y2_koord ) / 2)
    );
    canvas.fillStyle = '#000';
    canvas.font = betu_meret + "px " + betu_tipus;
}


function DoboztRajzol(canvas, x_koord, y_koord, szelesseg, magassag, szoveg_lista){

    canvas.fillStyle = '#fff';
    canvas.beginPath();
    canvas.moveTo( x_koord + window.offsetX -2 + r , y_koord + window.offsetY );
    canvas.lineTo( x_koord + szelesseg + window.offsetX, y_koord + window.offsetY);
    canvas.lineTo( x_koord + szelesseg + window.offsetX, y_koord + magassag + window.offsetY - r );
    canvas.lineTo( x_koord + szelesseg + window.offsetX - r, y_koord + magassag + window.offsetY );
    canvas.lineTo( x_koord + window.offsetX, y_koord + magassag + window.offsetY);
    canvas.lineTo( x_koord + window.offsetX, y_koord + window.offsetY + r);  
    canvas.fill();  
    canvas.closePath();
    canvas.stroke();

    canvas.fillStyle = '#000';
    for (var it = 0; it < szoveg_lista.length; it++) {

        canvas.fillText(
            szoveg_lista[it],
            x_koord + window.offsetX + r  -1,
            y_koord + window.offsetY + 2.5*r + it*(betu_meret+1)
        );

    };
}

function AttributumDoboztRajzol(canvas, x_koord, y_koord, szelesseg, magassag, szoveg)
{
    var szovegSzelesseg = canvas.measureText(szoveg).width;

    if (szoveg == null) szoveg = "";

    canvas.fillStyle = '#fff';
    canvas.beginPath();

    canvas.moveTo( x_koord + window.offsetX + 2*r - ( betu_meret/4 ),                     y_koord + window.offsetY - r );
    canvas.lineTo( x_koord + szovegSzelesseg + window.offsetX + 2*r + ( betu_meret/4 ),    y_koord + window.offsetY - r );
    canvas.lineTo( x_koord + szovegSzelesseg + window.offsetX + 2*r + ( betu_meret/4 ),    y_koord + window.offsetY + r );
    canvas.lineTo( x_koord + window.offsetX + 2*r - ( betu_meret/4 ),                      y_koord + window.offsetY + r );
    canvas.lineTo( x_koord + window.offsetX + 2*r - ( betu_meret/4 ),                      y_koord + window.offsetY - r );

    canvas.fill();  
    canvas.closePath();
    canvas.stroke();

    canvas.fillStyle = '#000';
    canvas.fillText(
        szoveg,
        x_koord + window.offsetX + 2*r  -1,
        y_koord - Math.round( betu_meret/2 ) + r + 1 + window.offsetY -1
    );
}

function KarikatRajzol(canvas, x_koord, y_koord, szoveg)
{

    canvas.fillStyle = '#000';

    canvas.beginPath();
    canvas.arc(x_koord + window.offsetX, y_koord + window.offsetY, r, 0, 2*Math.PI);    
    canvas.fill();  
    canvas.closePath();
    canvas.stroke();


    canvas.fillStyle = '#FFFFFF';
    canvas.fillText(
        szoveg,
        x_koord - Math.round( (canvas.measureText(szoveg).width)/2 ) + window.offsetX -1,
        y_koord - Math.round( betu_meret/2 ) + r + 1 + window.offsetY -1
    );
}


function KozeppontotRajzol(canvas, koord, eltolas_x, eltolas_y ){

    canvas.strokeStyle= "#EEEEEE";

    canvas.beginPath();
    canvas.moveTo( eltolas_x + window.offsetX - koord, eltolas_y + window.offsetY - koord);
    canvas.lineTo( eltolas_x + window.offsetX + koord, eltolas_y + window.offsetY + koord);
    canvas.stroke();

    canvas.beginPath();
    canvas.moveTo( eltolas_x + window.offsetX + koord, eltolas_y + window.offsetY - koord);
    canvas.lineTo( eltolas_x + window.offsetX - koord, eltolas_y + window.offsetY + koord);
    canvas.stroke();

    canvas.strokeStyle= "#000000";
}


function FoglaltHelyetRajzol2(canvas, koord_x1, koord_x2, koord_Y , delta_Y){

    canvas.strokeStyle= "brown";

    canvas.beginPath();
    canvas.moveTo( window.offsetX + koord_x1, window.offsetY + koord_Y - delta_Y );
    canvas.lineTo( window.offsetX + koord_x1, window.offsetY + koord_Y + delta_Y);
    canvas.stroke();

    canvas.beginPath();
    canvas.moveTo( window.offsetX + koord_x2, window.offsetY + koord_Y - delta_Y);
    canvas.lineTo( window.offsetX + koord_x2, window.offsetY + koord_Y + delta_Y);
    canvas.stroke();

    canvas.beginPath();
    canvas.moveTo( window.offsetX + koord_x1, window.offsetY + koord_Y);
    canvas.lineTo( window.offsetX + koord_x2, window.offsetY + koord_Y);
    canvas.stroke();

    canvas.strokeStyle= "#000000";
}



function FoglaltHelyetRajzol(canvas, eltolas_x, szelesseg, koord_Y , delta_Y){

    FoglaltHelyetRajzol2(canvas, eltolas_x, eltolas_x+szelesseg, koord_Y, delta_Y);
}



/**
 * A listában megadott geometriai adatok ábrázolja a canvasan
 * @param {Array(GeometriaiAdat)} adat
 * @param {Boolean} bClean - letörölje e a rajzolás előtt a canvast.
 */

function SzelessegMatrixbolEsMeretKonstansbolEltolastSzamit(szelessegMatrix, csomopont)
{
    var szulosor_eltolas_merteke = 0;
    var testverek_eltolas_merteke = 0;

    var szulo_id = csomopont.SzuloID;

    if (csomopont.SzintSzama != 0)  // ha nem a gyökér csomópont, mivel arra amúgy sem kell eltolást számolni
    {
        var szulok_sora = szelessegMatrix[csomopont.SzintSzama-1];

        for (var szulojelolt in szulok_sora )   // az aktuális csp felett 1 szinttel levő csomópontok között keresés
        {
            var aktualisSzulojeloltID = szulok_sora[szulojelolt].ID ;
            if (aktualisSzulojeloltID != szulo_id)    // csak a szülőt balról megelőző csomópontok értéke számít
            {
                szulosor_eltolas_merteke += szulok_sora[szulojelolt].SzuksegesSzelessegMeret;
            }
            else
                break;
        }
    }

    var testverek_sora = szelessegMatrix[csomopont.SzintSzama];
    for (var testverjelolt in testverek_sora ) {
        
        if (testverek_sora[testverjelolt].ID != csomopont.ID )
        {
            if (csomopont.SzuloID == testverek_sora[testverjelolt].SzuloID)
            {
                testverek_eltolas_merteke += testverek_sora[testverjelolt].SzuksegesSzelessegMeret;
            }
        }
        else
            break;
    }
    return szulosor_eltolas_merteke + testverek_eltolas_merteke;
}


function DontesiFatRajzol(canvas, dontesiFa)
{

    var csomopontokBFSszerint = new Array();
    var szelessegMatrix = new Array();
    var magassagVektor = new Array();

    dontesiFa.ReszFaBFS_BejarassalTombbeAlakitas(dontesiFa.Gyoker, csomopontokBFSszerint);

    // szélességhez segédmátrix és a magassághoz segédvektor előszámítása
    for (var csp in csomopontokBFSszerint)
    {
        var csomopont = csomopontokBFSszerint[csp];

        if (szelessegMatrix[csomopont.SzintSzama] == null)
            szelessegMatrix[csomopont.SzintSzama] = new Array();

        szelessegMatrix[csomopont.SzintSzama].push(csomopont);

        if (magassagVektor[csomopont.SzintSzama] == null 
            || csomopont.SzuksegesMagassagMeret > magassagVektor[csomopont.SzintSzama])
            magassagVektor[csomopont.SzintSzama] = csomopont.SzuksegesMagassagMeret;
    }

    // kirajzoláshoz szükséges eltolások kiszámítása és letárolása
    for (var csp in csomopontokBFSszerint)
    {        
        var csomopont = csomopontokBFSszerint[csp];
        csomopont.Eltolas_X = SzelessegMatrixbolEsMeretKonstansbolEltolastSzamit(szelessegMatrix, csomopont);

        var magassag = 0;
        for (var i = 0; i < csomopont.SzintSzama; i++)
        {
            magassag += magassagVektor[i];
        }
        csomopont.Eltolas_Y = magassag;
    }

    var szintenBelulHanyadikCsomopont = 0;
    var szintenBelulEltolas = 0;
    var utolsoSzintszam = -1;

    for (var csp in csomopontokBFSszerint)
    {
        var csomopont = csomopontokBFSszerint[csp];


        var gyerekek = csomopont.Gyerekek;
        for (var gy in gyerekek)
        {
            VonalatRajzol(canvas, 
                csomopont.Eltolas_X + csomopont.SzuksegesSzelessegMeret/2, csomopont.Eltolas_Y, 
                gyerekek[gy].Eltolas_X + gyerekek[gy].SzuksegesSzelessegMeret/2 , gyerekek[gy].Eltolas_Y,
                gyerekek[gy].Szuro );
        }


        if (csomopont.SzintSzama != utolsoSzintszam)
        {
            szintenBelulHanyadikCsomopont = 0;
            szintenBelulEltolas = 0;
            utolsoSzintszam = csomopont.SzintSzama;
        }

        var szelesseg = dontesiFa.Gyoker.SzelessegMeretetSzamit();
        var eltolas = csomopont.Eltolas_X;
        var magassag = csomopont.Eltolas_Y;

        ////FoglaltHelyetRajzol(canvas, szintenBelulEltolas, csomopont.SzuksegesSzelessegMeret, 100 * utolsoSzintszam + 5 * szintenBelulHanyadikCsomopont, 10);
        //FoglaltHelyetRajzol(canvas, eltolas, csomopont.SzuksegesSzelessegMeret, magassag + 5 * szintenBelulHanyadikCsomopont, 10);

        var dobozSzelesseg = 100;
        var dobozMagassag = 70;
        var csp_kozepe_eltolas_x = eltolas + csomopont.SzuksegesSzelessegMeret/2 ;
        var csp_kozepe_eltolas_x_2 = eltolas + csomopont.SzuksegesSzelessegMeret/2 - dobozSzelesseg/2;
        var magassag2 = magassag - dobozMagassag / 2;

        DoboztRajzol(canvas, csp_kozepe_eltolas_x_2 , magassag2, dobozSzelesseg, dobozMagassag, csomopont.OsztoAttributumSzerintiAttributumErtekek );

        //KozeppontotRajzol(canvas, 20, csp_kozepe_eltolas_x, magassag);

        KarikatRajzol(canvas, csp_kozepe_eltolas_x_2, magassag2, csomopont.ID );
        AttributumDoboztRajzol(canvas, csp_kozepe_eltolas_x_2 , magassag2, dobozSzelesseg, dobozMagassag, csomopont.OsztoAttributum);

        szintenBelulEltolas += csomopont.SzuksegesSzelessegMeret;
        szintenBelulHanyadikCsomopont++;
    }
}
    

function AbrazolasGeometriaiCanvas(adat, szin, boolTorol){

    var c = document.getElementById("canvas");
    var canvas = c.getContext("2d");

    if (boolTorol) {
        canvas.fillStyle="#FFFFFF";
        canvas.fillRect(0,0,c.width/window.canvas_scale,c.height/window.canvas_scale);
        canvas.fillStyle="#000000";
    }
 
    canvas.lineWidth = vonalvastagsag;
    canvas.font = betu_meret + "px " + betu_tipus;
    canvas.strokeStyle= (szin) ? szin : "#000000";
    canvas.fillStyle= canvas.strokeStyle;

    DontesiFatRajzol(canvas, adat)
}


function AbrazolasAdatmatrixotBezarMuvelet()
{
    $('#container-left-data').hide();  
}


function AbrazolasCsomopontValasztasMuvelet(dontesiFa) { 

    var tbody = $("#level_csomopont_kivalasztas > tbody:last");
    tbody.empty();
    tbody.append("<tr><td>Adatok</td><td>Levél csomópontok</td><td>Kiválasztás</td></tr>");

    var csomopontok = dontesiFa.getReszFaCsomoponjaiInArray(dontesiFa.Gyoker);

    for (var csp in csomopontok) {

        var content = "<tr>" +
                            "<td><input type='button' class='btn btn-primary' value='Adatok' onclick='AbrazolasCsomopontotTablazatMutatasMuvelet(" +
                                '"' + csomopontok[csp].ID + '");' + "' /></td>" +
                            "<td>" + csomopontok[csp].ID + ". sorszámú</td>" +
                            "<td>";

        if ( csomopontok[csp].TaroltTabla.SzureshezOszlopNevek.length > 1 )
        {

            content += "<input type='button' class='btn btn-primary' value='Kiválaszt' ";
            if ( csomopontok[csp].OsztoAttributum != null )
            {
                content += "disabled='disabled'";
            }
            content += " onclick='AbrazolasCsomopontotKivalasztMuvelet(" + '"' + csomopontok[csp].ID + '");' + "' />";
        }
        else
        {
            content += "&nbsp;";
        }
        content +="</td></tr>" ;

        tbody.append( content );
    }
    content =  "<tr><td colspan='3'><input type='button' class='btn btn-primary' value='Adatokat megjelenítő panel bezárása' onclick='AbrazolasAdatmatrixotBezarMuvelet();'  /></td></tr>" ;
    tbody.append( content );
}




function AbrazolasCsomopontotKivalasztMuvelet(csomopont_id)
{
    var header = $("#attributum_kivalasztas_cim");
    header.empty();
    header.append (csomopont_id+". sorszámú csomopont választható attribútumai");

    $("#container-right-select-attributes").show(); 

    // TaroltTabla.SzureshezOszlopNevek

    var tbody = $("#attributum_kivalasztas > tbody:last");
    tbody.empty();
    tbody.append("<tr><td>Elérhető attribútumok</td><td>Kiválasztás</td></tr>");

    var dontesiFa = window.aktAdat["DontesiFa"];
    var adatmatrixot_tarolo_csomopont = dontesiFa.getCsomopontByIDFromTree(dontesiFa.Gyoker, csomopont_id);
    var oszlopnevek = adatmatrixot_tarolo_csomopont.TaroltTabla.SzureshezOszlopNevek;

    for (var index in oszlopnevek) {

        if ( index != oszlopnevek.length-1 ){

            tbody.append(   "<tr>" +
                            "<td>" +  oszlopnevek[index] + "</td>" +
                            "<td><input type='button' class='btn btn-primary' value='Kiválaszt' onclick='AbrazolasKivalasztottAttributumSzerintOsztasMuvelet(" +
                                '"' +  csomopont_id + '","' + oszlopnevek[index] +'");' + "' /></td>" +
                        "</tr>" );
        } 
        else 
        {
            tbody.append(   "<tr>" +
                            "<td>" +  oszlopnevek[index] + "</td>" +
                            "<td>&lt;célváltozó&gt;</td>" +
                        "</tr>" );
        }
    }
}


function CellaErtekekSzamitasaGiniIndexhez(magyarazo_valtozo, celvaltozo, adatmatrix, adatSzamlaloTabla, lehetseges_oszlopnevek, szureshez_oszlopnevek)
{

    var result1 = 0;
    var result2 = "";

    for (var ertek_it in adatSzamlaloTabla[magyarazo_valtozo])
    {
        //var ertek = adatSzamlaloTabla[magyarazo_valtozo][ertek_it];

        var szurtAdatMatrix = adatmatrix.filterBy(magyarazo_valtozo, ertek_it);

        var celvaltozo_ertekei = new Array();
        for (var celvaltozo_ertek_it in szurtAdatMatrix.AdatTabla)
        {
            var celvaltozo_ertek = szurtAdatMatrix.AdatTabla[celvaltozo_ertek_it][celvaltozo];

            if ( celvaltozo_ertekei[celvaltozo_ertek] == null)
                celvaltozo_ertekei[celvaltozo_ertek] = 0;

            celvaltozo_ertekei[celvaltozo_ertek] ++;
        }

        var total = 0;
        for (var i in celvaltozo_ertekei) {
            total += celvaltozo_ertekei[i];
        }

        result2 += "(";
        var voltElotte = false;
        var tmpResult = 0;
        for (var i in celvaltozo_ertekei) {
            
            tmpResult += ( celvaltozo_ertekei[i] / total ) * ( celvaltozo_ertekei[i] / total );
            if (voltElotte == true)
                result2 += "+";

            result2 += "(" + celvaltozo_ertekei[i] + "/" + total + ")^2";

            voltElotte = true;
        }
        result2 += ")";
        tmpResult = Math.round(tmpResult*10000)/10000;
        result2 += "=" + tmpResult + "\n";

        result1 += tmpResult;

    }
    var result1 = Math.round(result1*10000)/10000;
    var final = '<a title="'+result2+'">'+result1+'</a>';
    return final;
}



function CellaErtekekSzamitasaID3hoz(magyarazo_valtozo, celvaltozo, adatmatrix, adatSzamlaloTabla, lehetseges_oszlopnevek, szureshez_oszlopnevek)
{
    var total = 0;
    for (var ertek_it in adatSzamlaloTabla[magyarazo_valtozo])
    {
        var ertek = adatSzamlaloTabla[magyarazo_valtozo][ertek_it];
        total += ertek;
    }

    var result1 = 0;
    var result2 = "";
    for (var ertek_it in adatSzamlaloTabla[magyarazo_valtozo])
    {
        var ertek = adatSzamlaloTabla[magyarazo_valtozo][ertek_it];
        result1 -= (ertek / total) * (Math.log(ertek/total) / Math.log(2));

        result2 += "-(" + ertek + "/" + total + ")*log2(" + ertek + "/" + total +")";

    }
    var result1 = Math.round(result1*10000)/10000;
    result2 += "=" + result1;

    var final = '<a title="'+result2+'">'+result1+'</a>';
    return final;
}




function AbrazolasMetrikaTablazatotSzamit(adatmatrix, adatSzamlaloTabla, lehetseges_oszlopnevek, szureshez_oszlopnevek, hivando_fuggveny) {

    var content = "";

    var celvaltozo = lehetseges_oszlopnevek[lehetseges_oszlopnevek.length-1];
    for(var magyarazo_valtozo_it in lehetseges_oszlopnevek)
    {
        var magyarazo_valtozo = lehetseges_oszlopnevek[magyarazo_valtozo_it];
        if (celvaltozo != magyarazo_valtozo){ // feltesszük hogy az utolsó oszlop a célváltozó

            if (szureshez_oszlopnevek.indexOf(magyarazo_valtozo) > -1)
            {
                content += "<td onclick='Aknakereso(this);' >";
                content += hivando_fuggveny(magyarazo_valtozo, celvaltozo, adatmatrix, adatSzamlaloTabla, lehetseges_oszlopnevek, szureshez_oszlopnevek);
                content += "</td>";
            }
            else
            {
                content += "<td>-</td>";                
            }
        }
    }
    content += "<td>&lt;célváltozó&gt;</td>";
    return content;
}



function AbrazolasCsomopontotTablazatMutatasMuvelet(csomopont_id)
{
    var header = $("#adatmatrix_cim");
    header.empty();
    header.append ("A " + csomopont_id + ". sorszámú csomopont adatai");

    $('#container-left-data').show();  

    
    var tbody = $('#adatmatrixtabla');
    tbody.empty();

    var dontesiFa = window.aktAdat["DontesiFa"];
    var adatmatrixot_tarolo_csomopont = dontesiFa.getCsomopontByIDFromTree(dontesiFa.Gyoker, csomopont_id);

    var szureshez_oszlopnevek = adatmatrixot_tarolo_csomopont.TaroltTabla.SzureshezOszlopNevek;
    var lehetseges_oszlopnevek = adatmatrixot_tarolo_csomopont.TaroltTabla.LehetsegesOszlopNevek;
    var tabla       = adatmatrixot_tarolo_csomopont.TaroltTabla.AdatTabla;

    // táblázat címsora
    var content = "<tr><th>&nbsp;</th>";
    for (var oszlopnev in lehetseges_oszlopnevek) {

        content += "<th ";
        (szureshez_oszlopnevek.indexOf(lehetseges_oszlopnevek[oszlopnev]) >= 0) ? null : content += "class='deaktivalt_szurke'" ;
        content += " >"+lehetseges_oszlopnevek[oszlopnev]+"</th>";
         
    }
    content += "</tr>\n";

    var attributumSzamlaloTabla = new Array();
    // adat táblázat tartalma
    for (var i in tabla)
    {
        var sor = tabla[i];
        var sorszam = parseInt(i)+1;

        content += "\t<tr>";  
        content += "<td onclick='Aknakereso(this);' >"+ sorszam +"</td>";

        for (var o in lehetseges_oszlopnevek) {

            var oszlopnev = lehetseges_oszlopnevek[o];
            content += "<td  onclick='Aknakereso(this);' ";
            (szureshez_oszlopnevek.indexOf(oszlopnev) >= 0) ? null : content += "class='deaktivalt_szurke'" ;
            content += " >"+ sor[oszlopnev] +"</td>";

            if (attributumSzamlaloTabla[oszlopnev] == null)
            {
                attributumSzamlaloTabla[oszlopnev] = new Array();
            }
            
            if (attributumSzamlaloTabla[oszlopnev][sor[oszlopnev]] == null)
                attributumSzamlaloTabla[oszlopnev][sor[oszlopnev]] = 0;

            attributumSzamlaloTabla[oszlopnev][sor[oszlopnev]] ++;
        }
        content += "</tr>\n";
    }

    var content2 = "<tr><th>&nbsp;</th>";
    for (var oszlopnev in lehetseges_oszlopnevek) {

        content2 += "<th>"+lehetseges_oszlopnevek[oszlopnev]+"</th>";
    }
    content2 += "</tr>\n";

    // Szummázó táblázat
    content2 += "\t<tr><td>&nbsp;</td>";
    for (var oszlopnev in attributumSzamlaloTabla)
    {
        var cell_content = "<td onclick='Aknakereso(this);' >";
        cell_content += "<table>";

        var ertekTomb = new Array();
        for (var ertek in attributumSzamlaloTabla[oszlopnev])
        {
            cell_content += "<tr><td>";
            cell_content += ertek;
            cell_content += ":&nbsp;&nbsp;&nbsp;</td><td>";
            cell_content += attributumSzamlaloTabla[oszlopnev][ertek];;
            cell_content += "</td></tr>";
        }
        cell_content += "</table>";
        cell_content += "</td>";

        content2 += cell_content;
    }
    content2 += "</tr>\n"; 


    // Metrikák
    content2 += "\t<tr>";
    content2 += "<td onclick='Aknakereso(this);' >ID3</td>";
    content2 += AbrazolasMetrikaTablazatotSzamit(adatmatrixot_tarolo_csomopont.TaroltTabla, attributumSzamlaloTabla, 
        lehetseges_oszlopnevek, szureshez_oszlopnevek, CellaErtekekSzamitasaID3hoz);
    content2 += "</tr>\n"; 

    content2 += "\t<tr>";
    content2 += "<td onclick='Aknakereso(this);' >GINI</td>";
    content2 += AbrazolasMetrikaTablazatotSzamit(adatmatrixot_tarolo_csomopont.TaroltTabla, attributumSzamlaloTabla, 
        lehetseges_oszlopnevek, szureshez_oszlopnevek, CellaErtekekSzamitasaGiniIndexhez);
    content2 += "</tr>\n"; 

    content2 += "\t<tr>";
    content2 += "<td colspan='"+(lehetseges_oszlopnevek.length+1)+"'>&nbsp;</td>";
    content2 += "</tr>\n"; 

    tbody.append( content2+content );
}


function KivalasztottAttributumotCsomopontraAlkalmazMuvelet(oszto_csomopont_azonosito, kivalasztott_attributum)
{
    var dontesiFa = window.aktAdat["DontesiFa"];
    var csomopont = dontesiFa.getCsomopontByIDFromTree(dontesiFa.Gyoker, oszto_csomopont_azonosito);

    csomopont.OsztoAttributum = kivalasztott_attributum;
    var OszlopNevekTMP = csomopont.TaroltTabla.SzureshezOszlopNevek.slice(0);

    var adatMatrixLista = new Array();
    for(var sor in csomopont.TaroltTabla.AdatTabla)
    {
        var tabla_egy_sora = csomopont.TaroltTabla.AdatTabla[sor];
        var attriutum_erteke = tabla_egy_sora[kivalasztott_attributum];
        if ( csomopont.OsztoAttributumSzerintiAttributumErtekek.indexOf(attriutum_erteke) == -1 )
        {            
            csomopont.OsztoAttributumSzerintiAttributumErtekek.push(attriutum_erteke);
            adatMatrixLista[attriutum_erteke] = new AdatMatrix();
        }
        adatMatrixLista[attriutum_erteke].addLine(tabla_egy_sora);
    }

    for(var gy in csomopont.OsztoAttributumSzerintiAttributumErtekek)
    {
        var ujCsomopontAdatMatrixa = adatMatrixLista[csomopont.OsztoAttributumSzerintiAttributumErtekek[gy]];
        ujCsomopontAdatMatrixa.SzureshezOszlopNevek = OszlopNevekTMP;
        var index = OszlopNevekTMP.indexOf(kivalasztott_attributum);

        if (index >= 0) 
            OszlopNevekTMP.splice(index, 1);

        ujCsomopontAdatMatrixa.SzureshezOszlopNevek = OszlopNevekTMP; 

        var ujCsomopontAzonositoja = dontesiFa.createUjCsomopont(oszto_csomopont_azonosito, ujCsomopontAdatMatrixa);
        var ujCsomopont = dontesiFa.getCsomopontByIDFromTree(dontesiFa.Gyoker, ujCsomopontAzonositoja);

        ujCsomopont.Szuro = csomopont.OsztoAttributumSzerintiAttributumErtekek[gy];
    }

    dontesiFa.SzuksegesSzelessegetSzamolFaban(dontesiFa.Gyoker, 0);
    dontesiFa.SzuksegesMagassagotSzamolFaban(dontesiFa.Gyoker);

    Ujrarajzolas();

    window.Elozmenyek.addStep(window.aktID, window.aktAdat["DontesiFa"]);
    window.Elozmenyek.Ment();

}

function AbrazolasKivalasztottAttributumSzerintOsztasMuvelet(csomopont_azonosito, kivalasztott_attributum)
{

    KivalasztottAttributumotCsomopontraAlkalmazMuvelet(csomopont_azonosito, kivalasztott_attributum);

    SegitoSzoveg(  "A kiválasztott csomópont azonosítója: " + csomopont_azonosito + "<br />" +
                    "A kiválasztott attribútum neve: " + kivalasztott_attributum + "<br />" +
                    "A módosítás a fában megtörtént! <div class='btn btn-primary' onclick='Visszavonas()'>Visszavonás</div>");
    $('#container-right-select-attributes').hide();  

/*
    $('#ID_segitoszoveg').delay(3000).fadeOut( 1000, 


        function () {

/ *
            SegitoSzoveg("Jelenleg " + window.aktAdat["DontesiFa"].getAktualisCsomopontSzamNullatolSzamozva() + " db csomópontod van a döntési fában. " 
                + "A kiinduló adatmátrix " + window.aktAdat["DontesiFa"].Gyoker.TaroltTabla.SzureshezOszlopNevek.length 
                + " db attribútummal és " + window.aktAdat["DontesiFa"].Gyoker.TaroltTabla.AdatTabla.length + " db sorral rendelkezik.<br /><br />"
                + "Kérlek válassz egyet a döntési fa levelei közül és add meg az attribútumot, amely szerint szét szeretnéd osztani a (rész)tábla sorait."
            );
* /

    SegitoSzoveg("Jelenleg " + window.aktAdat["DontesiFa"].getAktualisCsomopontSzamNullatolSzamozva() + " db csomópontod van a döntési fában. " 
        + "A kiinduló adatmátrix " + window.aktAdat["DontesiFa"].Gyoker.TaroltTabla.SzureshezOszlopNevek.length 
        + " db attribútummal és " + window.aktAdat["DontesiFa"].Gyoker.TaroltTabla.AdatTabla.length + " db sorral rendelkezik.<br /><br />"
        + "Kérlek válassz egyet a döntési fa levelei közül és add meg az attribútumot, amely szerint szét szeretnéd osztani a (rész)tábla sorait. <div class='btn btn-primary' onclick='Visszavonas()'>Visszavonás</div>"
    );

            $('#ID_segitoszoveg').fadeIn(); 
        });
*/
}

function Visszavonas(){

    if (! VisszavonasAktiv() )
        return;

    var tmp = window.Elozmenyek.getLastStep(window.aktID, true, 2);
    window.aktAdat["DontesiFa"] = tmp.copyTree();
    Ujrarajzolas();
}

function VisszavonasAktiv()
{
    var dt = window.aktAdat["DontesiFa"];
    if (dt.CsomopontokSzama > 1)
        return true;
    else
        return false;
}


// -----------------------------------------------------------------------------------------------
// UI segítő függvények
//
function Aknakereso(TableCell) {


    var tmp = $(TableCell);

    if ( tmp.hasClass("btn-success") ) {

        tmp.removeClass("btn-success");
        tmp.addClass("btn-warning");
        return;
    }

    if ( tmp.hasClass("btn-warning") ) {

        tmp.removeClass("btn-warning");
        tmp.addClass("btn-danger");
        return;
    }

    if (tmp.hasClass("btn-danger")) {

        tmp.removeClass("btn-danger");
        return;
    } 

    tmp.addClass("btn-success");
    return;

}

function CanvasScale(s) {
    if ( s != 0) window.canvas_scale*= s;
    var c      = document.getElementById('canvas'),
        canvas = c.getContext("2d");

    canvas.scale(s,s);
    Ujrarajzolas();
}



/////////////////////////////////////////////////////////////////////////////////////////////////////
// ----------------------------------------------------------------------------------------------- //
// Osztályok                                                                                       //
// ----------------------------------------------------------------------------------------------- //
/////////////////////////////////////////////////////////////////////////////////////////////////////



function AdatMatrix() {
    
    this.SzureshezOszlopNevek   = new Array();
    this.LehetsegesOszlopNevek  = new Array();
    this.AdatTabla              = new Array();
}

    AdatMatrix.prototype.addLine = function (ertekParLista) {

        this.AdatTabla[this.AdatTabla.length] = new Array();

        for (key in ertekParLista) {

            // ha a bejövő adat oszlopa még nincs benne az eddig letárolt oszlopnevek között
            if ( this.SzureshezOszlopNevek.indexOf(key) == -1 )      
            {
                this.SzureshezOszlopNevek.push(key);
                this.LehetsegesOszlopNevek.push(key);
            }
            this.AdatTabla[this.AdatTabla.length-1][key] = ertekParLista[key];
        };

    }

    AdatMatrix.prototype.getValue  = function (index, oszlopNev) {

        var obj = this.AdatTabla[index][oszlopNev];
        return obj;
    }

    AdatMatrix.prototype.getLineCount  = function () {

        var count = this.AdatTabla.length;
        return obj;
    }

    AdatMatrix.prototype.filterBy  = function (oszlop_neve, oszlop_erteke) {

        var ret = new AdatMatrix();
        for (var i = 0; i < this.AdatTabla.length; i++)
        {
            if (this.AdatTabla[i][oszlop_neve] == oszlop_erteke)
            {
                ret.addLine(this.AdatTabla[i]);
            }
        }
        return ret;
    }

    AdatMatrix.prototype.initAdatMatrixByLocalStorageObject = function(ennek_az_adatmatrixnak_megfelelo_adatmatrix){

        this.SzureshezOszlopNevek   = ennek_az_adatmatrixnak_megfelelo_adatmatrix.SzureshezOszlopNevek;
        this.LehetsegesOszlopNevek  = ennek_az_adatmatrixnak_megfelelo_adatmatrix.LehetsegesOszlopNevek;
        this.AdatTabla              = ennek_az_adatmatrixnak_megfelelo_adatmatrix.AdatTabla;
    }

    AdatMatrix.prototype.deepCopy = function () {

        var this_copy = new AdatMatrix();

        this_copy.SzureshezOszlopNevek   = jQuery.extend(true, [], this.SzureshezOszlopNevek);
        this_copy.LehetsegesOszlopNevek  = jQuery.extend(true, [], this.LehetsegesOszlopNevek);

        this_copy.AdatTabla              = new Array();
        for (var i = 0; i < this.AdatTabla.length; i++ )
        {
            this_copy.AdatTabla[i] = jQuery.extend(true, [], this.AdatTabla[i]);
        }

        return this_copy;
    }



function Csomopont( id, szulo_id, taroltTabla ){

    this.ID = id;
    this.SzuloID = szulo_id;
    this.TaroltTabla = taroltTabla;

    this.OsztoAttributum = null;
    this.OsztoAttributumSzerintiAttributumErtekek = new Array();
    this.Gyerekek = new Array();

    this.Szuro = null;  // ez az információ jelenik meg az éleken, gyökérnél értelemszerűen üres, a gyerekből kell olvasni az értéket

    this.SzintSzama = null;
    this.SzuksegesSzelessegMeret = null;
    this.SzuksegesMagassagMeret = null;

    this.Eltolas_X = null;
    this.Eltolas_Y = null;
}

    Csomopont.prototype.isLeveel  = function () {

        return this.Gyerekek.length == 0 ? true : false;
    }


    Csomopont.prototype.MagassagMeretetSzamit  = function () {

        return 170;
    }

    Csomopont.prototype.SzelessegMeretetSzamit  = function () {

        return 200;
    }

    Csomopont.prototype.deepCopy = function () {

        var this_copy = new Csomopont();

        var gyerekerol_deep_copy = new Array();
        for(var ch in this.Gyerekek)
        {
            if (this.Gyerekek[ch] != null)
            {
                gyerekerol_deep_copy[ch] = this.Gyerekek[ch].deepCopy();
            }
        }

        this_copy.ID                                        = this.ID;
        this_copy.SzuloID                                   = this.SzuloID;
        this_copy.TaroltTabla                               = this.TaroltTabla.deepCopy();

        this_copy.OsztoAttributum                           = this.OsztoAttributum;
        this_copy.OsztoAttributumSzerintiAttributumErtekek  = jQuery.extend(true, [], this.OsztoAttributumSzerintiAttributumErtekek);
        this_copy.Gyerekek                                  = gyerekerol_deep_copy;

        this_copy.Szuro                                     = this.Szuro;; 

        this_copy.SzintSzama                                = this.SzintSzama;
        this_copy.SzuksegesSzelessegMeret                   = this.SzuksegesSzelessegMeret;
        this_copy.SzuksegesMagassagMeret                    = this.SzuksegesMagassagMeret;

        this_copy.Eltolas_X                                 = this.Eltolas_X;
        this_copy.Eltolas_Y                                 = this.Eltolas_Y;

        return this_copy;
    }

    Csomopont.prototype.initCsomopontByLocalStorageObject = function (ennek_a_csomopontnak_megfelelo_pont)
    {

        this.Gyerekek = Array();
        for (var ch in ennek_a_csomopontnak_megfelelo_pont.Gyerekek) {

            var gyerkoc = new Csomopont();
            
            var hamis_gyerek = ennek_a_csomopontnak_megfelelo_pont.Gyerekek[ch];
            //this.Gyerekek[ch] = this.initCsomopontByLocalStorageObject( hamis_gyerek );
            this.Gyerekek.push(gyerkoc.initCsomopontByLocalStorageObject( hamis_gyerek ) );
        };


        this.ID                                         = ennek_a_csomopontnak_megfelelo_pont.ID;
        this.SzuloID                                    = ennek_a_csomopontnak_megfelelo_pont.SzuloID;

        var taroltTabla = new AdatMatrix();
        taroltTabla.initAdatMatrixByLocalStorageObject(ennek_a_csomopontnak_megfelelo_pont.TaroltTabla);;
        this.TaroltTabla                                = taroltTabla;

        this.OsztoAttributum                            = ennek_a_csomopontnak_megfelelo_pont.OsztoAttributum;
        this.OsztoAttributumSzerintiAttributumErtekek   = ennek_a_csomopontnak_megfelelo_pont.OsztoAttributumSzerintiAttributumErtekek;
        
        this.Szuro                                      = ennek_a_csomopontnak_megfelelo_pont.Szuro; 

        this.SzintSzama                                 = ennek_a_csomopontnak_megfelelo_pont.SzintSzama ;
        this.SzuksegesSzelessegMeret                    = ennek_a_csomopontnak_megfelelo_pont.SzuksegesSzelessegMeret;
        this.SzuksegesMagassagMeret                     = ennek_a_csomopontnak_megfelelo_pont.SzuksegesMagassagMeret;

        this.Eltolas_X                                  = ennek_a_csomopontnak_megfelelo_pont.Eltolas_X;
        this.Eltolas_Y                                  = ennek_a_csomopontnak_megfelelo_pont.Eltolas_Y;


        return this;
    }


function DontesiFa()
{
    this.Gyoker = null;
    this.CsomopontokSzama = 0;
}


    DontesiFa.prototype.copyTree = function ()
    {
        var dontesiFa = new DontesiFa();
        var gyoker = this.Gyoker.deepCopy();
        var tmp = new Array();

        this.ReszFaBFS_BejarassalTombbeAlakitas(gyoker, tmp);

        dontesiFa.Gyoker = gyoker;
        dontesiFa.CsomopontokSzama = tmp.length;

        return dontesiFa;
    }

    DontesiFa.prototype.initTreeByLocalStorageObject = function (localStorageObject)
    {
        //Csomopont( id, szulo_id, taroltTabla )
        //var obj = new Csomopont(this.CsomopontokSzama, 0, taroltTabla);

        var csomopont = new Csomopont();
        csomopont.initCsomopontByLocalStorageObject(localStorageObject.Gyoker)

        this.Gyoker = csomopont;
        this.CsomopontokSzama = localStorageObject.CsomopontokSzama;

        return this;
    }

    DontesiFa.prototype.getCsomopontByIDFromTree  = function (reszFaGyokerCsomopontja, keresettID) {

        if(reszFaGyokerCsomopontja.ID == keresettID) 
            return reszFaGyokerCsomopontja;

        var tmp = null;

        if (reszFaGyokerCsomopontja != null)
        {

            for (var csp in reszFaGyokerCsomopontja.Gyerekek) {

                var gyerek = reszFaGyokerCsomopontja.Gyerekek[csp];
                var obj = this.getCsomopontByIDFromTree(gyerek, keresettID);

                if ( obj != null )
                    tmp = obj;
            }
        }
        return tmp;
    }  

    DontesiFa.prototype.createGyokerCsomopont  = function (taroltTabla) {
        
        this.CsomopontokSzama = 0;  
        var obj = new Csomopont(this.CsomopontokSzama, 0, taroltTabla);
        this.CsomopontokSzama++;  

        if (this.Gyoker == null)
            this.Gyoker = obj;
    }  

    DontesiFa.prototype.createUjCsomopont  = function (szulo_ID, taroltTabla) {

        var ujID = this.CsomopontokSzama;
        var obj = new Csomopont(ujID, szulo_ID, taroltTabla);
        var parent = this.getCsomopontByIDFromTree(this.Gyoker, szulo_ID);

        parent.Gyerekek.push(obj);
        this.CsomopontokSzama++; 

        return ujID; 
    }   

    DontesiFa.prototype.ReszFaBFS_BejarassalTombbeAlakitas  = function (csomopont, Tomb) {

        var lista = new Array();
        Tomb.push(csomopont);
        lista.push(csomopont);

        while(lista.length != 0)
        {
            var elsoElem = lista[0];
            for (var csp in elsoElem.Gyerekek)
            {
                var gyerek = elsoElem.Gyerekek[csp];
                lista.push(gyerek);
                Tomb.push(gyerek);
            }
            lista.splice(elsoElem, 1);
        }
    }

    DontesiFa.prototype.getReszFaCsomoponjaiInArray  = function (csomopont) {

        var ret = new Array();
        this.ReszFaBFS_BejarassalTombbeAlakitas(csomopont, ret);

        return ret;
    } 

    DontesiFa.prototype.getAktualisCsomopontSzamNullatolSzamozva  = function () {

        return this.CsomopontokSzama;
    }


    DontesiFa.prototype.SzuksegesSzelessegetSzamolFaban = function(csomopont, szintszam)
    {
        csomopont.SzintSzama = szintszam;
        if ( csomopont.isLeveel() )
        {
            var ret = csomopont.SzelessegMeretetSzamit();
            csomopont.SzuksegesSzelessegMeret = ret;
            return ret;
        }

        // else
        var sajatMagaAltalFoglaltSzelesseg = csomopont.SzelessegMeretetSzamit();
        var gyerekekAltalFoglaltSzelesseg = 0;

        for (var csp in csomopont.Gyerekek)
        {
            var gyerek = csomopont.Gyerekek[csp];
            gyerekekAltalFoglaltSzelesseg += this.SzuksegesSzelessegetSzamolFaban(gyerek, szintszam+1);
        }

        csomopont.SzuksegesSzelessegMeret = Math.max( gyerekekAltalFoglaltSzelesseg, sajatMagaAltalFoglaltSzelesseg);

        return csomopont.SzuksegesSzelessegMeret;
    }

    DontesiFa.prototype.SzuksegesMagassagotSzamolFaban = function(csomopont)
    {
        if ( csomopont.isLeveel() )
        {
            csomopont.SzuksegesMagassagMeret = csomopont.MagassagMeretetSzamit();
            return;
        }
        // else
        for (var csp in csomopont.Gyerekek)
        {
            var gyerek = csomopont.Gyerekek[csp];
            this.SzuksegesMagassagotSzamolFaban(gyerek);
        }
        csomopont.SzuksegesMagassagMeret = csomopont.MagassagMeretetSzamit();

    }


// -----------------------------------------------------------------------------------------------
// Elozmenyek obj
// Tobb elozmenyt fog össze. Annyiban több, mint egy lista, hogy képes menteni állapotát.
function Elozmeny(ID, Nev) {
    this.ID = ID || Date.now();
    this.Nev = Nev || (ID + " feladat");
    this.lepesek = Array();
}

function ElozmenyLista() {
    this.lista = Array();

    // lineáris keresés, hogy ID alapján lehessen indexelni.
    this.ker = function (ID) {
        for (var i= 0; i<this.lista.length; i++) {
            if (this.lista[i].ID == ID) return i;
        }
        return null;
    }
}

    // Betölti a permanens tárból az adatokat.
    ElozmenyLista.prototype.Betolt = function () {
        this.lista = JSON.parse( localStorage.getItem("Elozmenyek_dontesifa"));
        if (this.lista == null) {
            this.lista = Array();
            console.log("Nem volt mentett állapot. Üres lista betöltése.");
        } else {
            console.log(this.lista.length + " feladat betöltve a helyi tárolóból.");
        }
        return true;
    }

    // Kiírja a permanens tárba az adatokat.
    ElozmenyLista.prototype.Ment = function () {
        localStorage.setItem("Elozmenyek_dontesifa", JSON.stringify(this.lista));
        return true;
    }

    // Visszaadja a tárolt aadatok listáját. [{Nev,ID}, ... ] formában.
    ElozmenyLista.prototype.GetList = function () {
        var tmp = Array();
        for (var x in this.lista) {
            tmp.push( {ID : this.lista[x].ID , Nev : this.lista[x].Nev } );
        }
        return tmp;
    }

    // Új állapot létrehozása.
    ElozmenyLista.prototype.addItem = function (ID, Nev) {
        console.log("Új feladat elmentése. ID: " + ID + " , Nev: " + Nev );
        var tmp = new Elozmeny(ID, Nev);
        var index = this.lista.push(tmp);
        return index;
    }

    // Egy állapotároló törlése
    ElozmenyLista.prototype.deleteItem = function (ID) {
        var index = this.ker(ID);
        if (index != null) {
            this.lista.splice(index, 1);
            return true;
        }
        return false;
    }


function transFormDataMatrixToLocalStorageCompatible(csomopont) {

    for(var ch in csomopont.Gyerekek)
    {
        var gyerek = csomopont.Gyerekek[ch];
        transFormDataMatrixToLocalStorageCompatible(gyerek);
    }

    var adatmatrix = csomopont.TaroltTabla.AdatTabla;

    var content = "";
    for(var i in adatmatrix)
        for (var j in adatmatrix[i])
            content += i+"\t"+j+"\t"+adatmatrix[i][j]+"\n";

    csomopont.TaroltTabla.SzerializaltTabla = content;


}


function reTransFormLocalStorageCompatibleToDataMatrix(csomopont) {


    var szerializalt_adatmatrix = csomopont.TaroltTabla.SzerializaltTabla;
    var adatvektor = szerializalt_adatmatrix.split("\n");

    for (var it = 0; it < adatvektor.length; it++) {
        
        var sor = adatvektor[it];
        var ertekek = sor.split("\t");

        if (ertekek != "")
        {
            var i = ertekek[0];
            var j = ertekek[1];
            var v = ertekek[2];

            csomopont.TaroltTabla.AdatTabla[i][j] = v;
        }
    };


    for(var ch in csomopont.Gyerekek)
    {
        var gyerek = csomopont.Gyerekek[ch];
        reTransFormLocalStorageCompatibleToDataMatrix(gyerek);
    }
}


    ElozmenyLista.prototype.addStep = function (ID, adat ) {

        var newObject = adat.copyTree();

        transFormDataMatrixToLocalStorageCompatible(newObject.Gyoker);


        var index = this.ker(ID);
        if (index != null) {
            this.lista[index].lepesek.push( newObject );
            return true;
        }
        return false;
    }

    // Visszaadja egy előzmény utolsó elemét és törli azt. Az az előzménytől függ, hogy ez (A,B)->C vagy A->(B,C) alakú.
    ElozmenyLista.prototype.getLastStep = function (ID, ToroljeIs, prevTime) {
        var index = this.ker(ID);
        if (index != null) {
            if (this.lista[index].lepesek.length > 0) {
                var tmp = this.lista[index].lepesek[ this.lista[index].lepesek.length - prevTime];

                reTransFormLocalStorageCompatibleToDataMatrix(tmp.Gyoker);

                if (ToroljeIs) 
                    this.lista[index].lepesek.pop();
                return tmp;
            }
        }
        return null;
    }

    ElozmenyLista.prototype.getNev = function(ID) {
        var index = this.ker(ID);
        if (index != null) {
            return this.lista[index].Nev;
        }
        return null;
    }
