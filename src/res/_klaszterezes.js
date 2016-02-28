/////////////////////////////////////////////////////////////////////////////////////////////////////
// inicializálása                                                                                  //
/////////////////////////////////////////////////////////////////////////////////////////////////////
$('#ID_feladat').hide();            // A második lépés elrejtése.

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


window.offsetX = 0;                    // A canvasen lévő pontok eltolása. Egérrel változtatható.
window.offsetY = 0;

window.startx =0;                      // Kezdőpontok az egér mozgásának lekövetéséhez.
window.starty =0;

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
        window.offsetX += evt.clientX - window.startx;
        window.offsetY += evt.clientY - window.starty;
        window.startx = evt.clientX;
        window.starty = evt.clientY;
        Ujrarajzolas();
    }
}
 
function doMouseUp(evt) {
    window.isMouseDown = false;
    //log("Offset: " + window.offsetX + ":" + window.offsetY);
}


/**
 * Betölti az adat.js-ben és az Előzményekben található adatokat ahhoz, hogy a felhasználó kiválaszthassa a megfelelő feladatot.
 * A kattintást a FeladatKivalasztasa(<feladatnev|feladatid>,[elozmenybelie true]) függvény végzi e.
 */
function FeladatokBetoltese(){
    // Új feladatok betöltése
        var feladatok = '';
        for (var x in window.adat_klaszterezes) {
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

    console.log("Feladat kiválasztása: " + selected);

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
        window.aktAdat = null;
        //var tmp = window.Elozmenyek.getLastStep(window.aktID);

    } else {

        $("#container-right").hide();   // nincs szükség arra az ablakra ami a klaszterek összevonását végzi, mivel még nincsenek klaszterek

        window.aktID = null;
        window.aktFeladatNev = selected;
        window.aktAdat = Array();
        for (var i =0; i< window.adat_klaszterezes[selected].length; i++) {
            // data.js adatainak transzformálása. Innentől kezdve csak olyan adat van a rendszerben, ami valamilyen jól definiált osztályba tartozik.
            window.aktAdat.push( new GeometriaiAdat(
                window.adat_klaszterezes[selected][i].Nev,
                window.adat_klaszterezes[selected][i].X,
                window.adat_klaszterezes[selected][i].Y
            ));
        }

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



/**
 * A felhasználó kiválasztotta, hogy milyen módon szeretné klaszterezni az elemeket.
 * @param {String} tipus = {bottomup, topdown }
 */
function KlaszterbePakolas(tipus) {
    window.aktID = Date().toLocaleString();
    window.Elozmenyek.addItem( window.aktID, window.aktID + " - " + window.aktFeladatNev, tipus == "bottomup");

    if (tipus=="bottomup") {
        // Bottom up klaszterezés. Minden pontot egy önálló klaszterbe pakolunk
        for ( var i = 0; i< window.aktAdat.length ; i++) {
            var tmp = new Klaszter(window.aktAdat[i].Nev);
            tmp.addElement(window.aktAdat[i]);
            window.Elozmenyek.addKlaszter(window.aktID, tmp);
        }

    } else {
        // TopDown klaszterezés, egy klaszterbe rakunk minden pontot.
        console.log("Kattintott a gomba, topdown");
        var tmp = new Klaszter("Klaszter1");
        for ( var i = 0; i< window.aktAdat.length ; i++) {
            tmp.addElement(window.aktAdat[i]);
        }
        window.Elozmenyek.addKlaszter(window.aktID, tmp);

    }


    $("#container-right").show(); // A klaszterek összevonását/szétválasztását végző rész megjelenítése
    window.Elozmenyek.Ment();
    Ujrarajzolas(); // A felület újrarajzolása

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




/**
 * Elvégzi a felület újrarajzolását.
 * FIGYELEM! Használja a globális állapotváltozókat.
 */
function Ujrarajzolas() {
    console.log("Újrarajzolás");
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

        if ( aktID == null ) {

            AbrazolasGeometriaiCanvas(window.aktAdat, "#000000", true);

            if (  $('#zhtablazat-euk tr').length == 0) {
                AbrazolasGeometriaiZHTablazat( window.aktAdat, $('#zhtablazat-euk'), TavolsagEuklideszi );
                AbrazolasGeometriaiZHTablazat( window.aktAdat, $('#zhtablazat-xy'), TavolsagXY );

                SegitoSzoveg("<b>2. lépés:</b> Jelenleg " + window.aktAdat.length + " db pontod van. Ezek nem klaszterek, hanem külön álló pontok, amelyeket klaszterezni szeretnénk. A klaszterezés során... <br /><br />Kérlek válassz, hogy Bottom-up, vagy Top-down jellegű klaszterezést szeretnél végezni." +
                        "<br /><br /><button type='button' class='btn btn-primary' onclick='KlaszterbePakolas(" + '"bottomup"' + ");'>Bottom-up</button> " +
                        "<button type='button' class='btn btn-primary' onclick='KlaszterbePakolas(" + '"topdown"' + ");'>Top-Down</button>"
                );
            }

        } else {
    /*
        3. Kirajzoljuk a klasztereket a vászonra.
        4. Kirajzoljuk a klaszterekből származó pontokat, távolságnak. (Sorrendezni kell :S)
        5. Kirajzoljuk a klaszter táblázatot is jobb oldalra.
        6. Vesszük az előzményekből az utolsó lépést. S kiírjuk, mint segítő szöveg.
    */

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

    } // if window.aktFeladatNev == null

} // function ViewFrissites



/**
 * A listában megadott geometriai adatok ábrázolja a canvasan
 * @param {Array(GeometriaiAdat)} adat
 * @param {Boolean} bClean - letörölje e a rajzolás előtt a canvast.
 */
function AbrazolasGeometriaiCanvas(adat, szin, boolTorol){
 
    var c = document.getElementById("canvas");
    var canvas = c.getContext("2d");
 
    if (boolTorol) {
        canvas.fillStyle="#FFFFFF";
        canvas.fillRect(0,0,c.width,c.height);
        canvas.fillStyle="#000000";
    }
 
    canvas.lineWidth = vonalvastagsag;
        canvas.font = betu_meret + "px " + betu_tipus;
    canvas.strokeStyle= (szin) ? szin : "#000000";
    canvas.fillStyle= canvas.strokeStyle;
 
        for ( var i in adat) {
                canvas.beginPath();
                canvas.arc(adat[i].Xkoord + window.offsetX, adat[i].Ykoord + window.offsetY, r, 0,2*Math.PI);
        canvas.closePath();
                canvas.stroke();
 
                canvas.fillText(
                        adat[i].Nev,
                        adat[i].Xkoord + felirat_x - Math.round( (canvas.measureText(adat[i].Nev).width)/2 ) + window.offsetX,
                        adat[i].Ykoord + felirat_y - Math.round( betu_meret/2 ) + r + 1 + window.offsetY
                );
 
        };
}


/**
 * A listában megadott Klasztereket ábrázolja a canvasan.
 * @param {Array(Klaszter)} adat
 */
function AbrazolasKlaszterekCanvas(adat) {
     /*
    AbrazolasGeometriaiCanvas(adat[0].getElements(), "#000000", true);
    for (var i = 1; i< adat.length; i++) {
        AbrazolasGeometriaiCanvas( adat[i].getElements(), GetColor(i));
    }
    */
   // OOP megsértése, mert a betöltött feladatokon nem működött a getElements() függvény.
    AbrazolasGeometriaiCanvas(adat[0].elemek, "#000000", true);
    for (var i = 1; i< adat.length; i++) {
        AbrazolasGeometriaiCanvas( adat[i].elemek, GetColor(i));
    }
}


/**
 * Elkészíti az összevonáshoz, vagy épp szétválasztáshoz szükséges táblázatot.
 * @param {Array(Klaszter)} adat
 * @param {$("#tableid")} table
 * @param {Boolean} bottomup
 */
function AbrazolasKlaszterekMuvelet(adat, bottomup) {

    console.log("Abrazolaas művelet: " + bottomup);

    var tbody = $("#adatokosszevonas > tbody:last");
    tbody.empty();

    if (bottomup) {

        tbody.append("<tr><td colspan='2'>Klaszterek</td><td>Összevonás</td></tr>");

        for (var i in adat) {
            for (var j=i; j<adat.length; j++) {

                if (j!=i) { tbody.append(

                    "<tr>" +
                        "<td>" + adat[i].ID + "</td>" +
                        "<td>" + adat[j].ID + "</td>" +
                        "<td><input type='button' class='btn btn-primary' value='Összevonás' onclick='KlaszterekOsszevonasa(" +
                            '"' + adat[i].ID + '","' + adat[j].ID + '");' + "' /></td>" +
                    "</tr>"

                );}


            } // for j
        } // for i

    } else {
        // még nincs implementálva.

        tbody.append("<tr><td>A</td><td>Jelenlegi klaszterek</td><td>B</td></tr>");

        for (var i in adat) {

            tbody.append("<tr><td colspan='3' align='center'>" + adat[i].ID + "</td></tr>");
            //var elemek = adat[i].getElements();
            var elemek = adat[i].elemek;

            for (var j in elemek) {

                tbody.append(
                    "<tr><td><div class='glyphicon glyphicon-arrow-left'></div></td>" +
                        "<td align='center'>" + elemek[j].Nev + "</td>" +
                    "<td><div class='glyphicon glyphicon-arrow-right'></div></td></tr>"
                );

            } // for j
        } // for i

        tbody.append("<tr><td colspan='3' align='center'><div class='btn btn-primary'>Kiválasztottak szétválasztása</div></td></tr>")

    }

}

// A ZH-ban látható táblázatot generálja egy geometriai adat listából
function AbrazolasGeometriaiZHTablazat(adat, table, tavolsagfuggveny) {

    var row = '';
    for (var i=0 ;i<adat.length; i++) {
        row+= '<td>' + adat[i].Nev + '</td>';
    }
    table.append('<tr>' + row+ '<td></td></tr>');

    for (var i=0; i<adat.length; i++) {
        row = '';
        for (var j=0 ; j<adat.length ; j++) {
            if (j<i) {
                row += '<td></td>';
            } else {
                row+='<td onclick="Aknakereso(this);">' + tavolsagfuggveny(adat[i],adat[j]) + '</td>';
            }
        }
        row = '<tr>' + row + '<td>' + adat[i].Nev + '</td></tr>';
        table.append( row );
    }

}


/*
function FeladatTavolsagFeltoltese(adat) {
    var tbody = $('#adatoktavolsag > tbody:last');
    for (var i in adat) {
        for (var j=i; j<adat.length; j++) {

            tbody.append(
                '<tr>' +
                    '<td>' + adat[i].Nev +'</td>' +
                    '<td>' + adat[j].Nev +'</td>' +
                    '<td>' + TavolsagEuklideszi(adat[i],adat[j]) +'</td>' +
                    '<td>' + TavolsagXY(adat[i], adat[j]) +'</td>' +
                    '<td>42</td>' +
                '</tr>'
            );

        }
    }
}



/**
 * Visszaad egy hexa színt, 0-tól kezdve. Minden sorszámhoz más szín fog tartozni.
 * @param {int} sorszam
 */
function GetColor(sorszam) {
    switch (sorszam) {
        case  0: return "#3366FF";
        case  1: return "#6633FF";
        case  2: return "#CC33FF";
        case  4: return "#FF33CC";
        case  5: return "#33CCFF";
        case  3: return "#003DF5";
        case  6: return "#FF3366";
        case  7: return "#33FFCC";
        case  8: return "#B88A00";
        case  9: return "#F5B800";
        case 10: return "#FF6633";
        case 11: return "#33FF66";
        case 12: return "#66FF33";
        case 13: return "#CCFF33";
        case 14: return "#FFCC33";
        // TODO case 15: ...
    }
    return "#000000"; // switch default ága
}




// -----------------------------------------------------------------------------------------------
// Tavolságfüggvények
//

function TavolsagEuklideszi(a,b){
    return Math.round( Math.sqrt( (a.Xkoord-b.Xkoord)*(a.Xkoord-b.Xkoord) + (a.Ykoord-b.Ykoord)*(a.Ykoord-b.Ykoord)  ) * pontossag ) / pontossag;
}

function TavolsagXY(a,b) {
    return Math.abs(a.Xkoord-b.Xkoord) + Math.abs(a.Ykoord-b.Ykoord);
}


// -----------------------------------------------------------------------------------------------
// Use-case
//


function KlaszterekOsszevonasa(klaszter1, klaszter2) {
    console.log("Klaszterek összevonása: " + klaszter1 + " , " + klaszter2 );

    var k1 = window.Elozmenyek.getKlaszterByID(window.aktID, klaszter1);
    var k2 = window.Elozmenyek.getKlaszterByID(window.aktID, klaszter2);

    var tmp = new Klaszter(klaszter1+klaszter2);
    tmp.addElements( k1.getElements() );
    tmp.addElements( k2.getElements() );

    window.Elozmenyek.addStep(window.aktID, k1, k2, tmp);
    window.Elozmenyek.deleteKlaszterByID(window.aktID, klaszter1);
    window.Elozmenyek.deleteKlaszterByID(window.aktID, klaszter2);
    window.Elozmenyek.addKlaszter(window.aktID, tmp);

    window.Elozmenyek.Ment();
    Ujrarajzolas();

}


function Visszavonas(){

    var tmp = window.Elozmenyek.getLastStep(window.aktID, true);

    if ( window.Elozmenyek.BottomUP(window.aktID) ) {

        // Az első kettőből lett a harmadik. Tehát töröljük a harmadikat, és hozzáadjuk az első kettőt.
        window.Elozmenyek.deleteKlaszterByID(window.aktID, tmp[2].ID);
        window.Elozmenyek.addKlaszter(window.aktID, tmp[0]);
        window.Elozmenyek.addKlaszter(window.aktID, tmp[1]);

    } else {

        // Az elsőből lett az utolsó kettő. Tehát töröljük az utolsó kettőt, és hozzáadjuk az elsőt.
        window.Elozmenyek.deleteKlaszterByID(window.aktID, tmp[1].ID);
        window.Elozmenyek.deleteKlaszterByID(window.aktID, tmp[2].ID);
        window.Elozmenyek.addKlaszter(window.aktID, tmp[0]);

    }

    window.Elozmenyek.Ment();
    Ujrarajzolas();

}




// -----------------------------------------------------------------------------------------------
// UI segítő függvények
//
function Aknakereso(TableCell) {
 /*
    function Csereld(Obj, HaVan,Addneki) {
        if $(Obj).hasClass(HaVan) {
            $(Obj).removeClass(Havan);
            $(Obj).addClass(Addneki);
            return true;
        } else return false;
    }

    if (Seged(TableCell, "warning", "danger"))
        else if (Seged(TableCell,"danger", ""))
            else $(TableCell).addClass("warning");
*/

    var tmp = $(TableCell);
    if ( tmp.hasClass("btn-warning") ) {
        tmp.removeClass("btn-warning");
        tmp.addClass("btn-danger");
    } else
    if (tmp.hasClass("btn-danger")) {
        tmp.removeClass("btn-danger");
    } else {
        tmp.addClass("btn-warning");
    }

}


/*
function CanvasScale(event) {
    event = event || window.event;

    var c = document.getElementById('canvas'),
        canvas = c.getContext("2d"),
        x = event.pageX - c.offsetLeft,
        y = event.pageY - c.offsetTop;

    var bennevan = function (x, a,b) { return x>a && x<b;}

    if (bennevan(y, c.height-btn, c.height)) {
        if ( bennevan(x, c.width-2*btn, c.width-btn)) { canvas.scale(2,2); }
        if ( bennevan(x, c.width-btn, c.width))       { canvas.scale(0.5, 0.5); }
        Ujrarajzolas();
    }

}
*/
function CanvasScale(s) {
    var c = document.getElementById('canvas'),
        canvas = c.getContext("2d");

    canvas.scale(s,s);
    Ujrarajzolas();
}




/////////////////////////////////////////////////////////////////////////////////////////////////////
// ----------------------------------------------------------------------------------------------- //
// Osztályok                                                                                       //
// ----------------------------------------------------------------------------------------------- //
/////////////////////////////////////////////////////////////////////////////////////////////////////



/**
 * 2D Koordinátákkal rendelkező objektum. Minden tagváltozója publikus ~ struct
 * @param {String} Nev
 * @param {int} Xkoord
 * @param {int} Ykoord
 */
function GeometriaiAdat(Nev, Xkoord, Ykoord) {
    this.Nev = Nev;
    this.Xkoord = Xkoord;
    this.Ykoord = Ykoord;
}



// -----------------------------------------------------------------------------------------------
// Klaszter obj
// ID-val azonosított tároló, amiben Geometriai adatok vannak. Ez egy klaszter.
function Klaszter(ID) {
    this.ID = ID;
    this.elemek = Array();
}


Klaszter.prototype.addElement = function (GeometriaiAdat) {
    this.elemek.push(GeometriaiAdat);
}


Klaszter.prototype.addElements = function(GeometriaiAdatArray) {
    for (var i in GeometriaiAdatArray) {
        this.elemek.push(GeometriaiAdatArray[i]);
    }
}

Klaszter.prototype.getElements = function () {
    return this.elemek;
}




// -----------------------------------------------------------------------------------------------
// Elozmeny obj
// ID val, névvel rendelkező objektum, ami egy klaszterezés lépéseit tárolja.
/*

function Elozmeny(ID, Nev, bottomup) {
    this.ID = ID || Date.now();
    this.Nev = Nev || (ID + " feladat");
    this.bottomup = bottomup || true;
    this.lepesek = Array();
}


Elozmeny.prototype.isBottomUp = function (){
    return bottomup;
}

Elozmeny.prototype.pushLepes = function (ForrasKlaszterA, ForrasKlaszterB, CelKlaszter ) {
    this.lepesek.push( array(ForrasKlaszterA, ForrasKlaszterB, CelKlaszter) );
}

// TODO - listából elem törlése.
Elozmeny.prototype.popLepes = function () {
    var tmp = this.lepesek[this.lepesek.length-1];
    this.lepesek.length = this.lepesek.length-1;
    return tmp;
}
*/



// -----------------------------------------------------------------------------------------------
// Elozmenyek obj
// Tobb elozmenyt fog össze. Annyiban több, mint egy lista, hogy képes menteni állapotát.
function Elozmeny(ID, Nev, bottomup) {
    this.ID = ID || Date.now();
    this.Nev = Nev || (ID + " feladat");
    this.bottomup = bottomup;
    this.lepesek = Array();
    this.klaszterek = Array();
    console.log("Konstruktor: " + bottomup);
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
    this.lista = JSON.parse( localStorage.getItem("Elozmenyek"));
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
    localStorage.setItem("Elozmenyek", JSON.stringify(this.lista));
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
ElozmenyLista.prototype.addItem = function (ID, Nev, bottomup) {
    console.log("Új feladat elmentése. ID: " + ID + " , Nev: " + Nev + " , bottomup: " + bottomup);
    var tmp = new Elozmeny(ID, Nev, bottomup);
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


// Egy ID-val azonosított előzményhez egy lépés hozzáadása.
// Amennyiben bottomup klaszterezés, úhogy A és B a C-be összevont klaszterek.
// Amennyiben top-down, úgy A a B-re és C-re szétválasztott klaszterek.
ElozmenyLista.prototype.addStep = function (ID, KlaszterA, KlaszterB, KlaszterC ) {
    var index = this.ker(ID);
    if (index != null) {
        this.lista[index].lepesek.push( Array(KlaszterA, KlaszterB, KlaszterC) );
        return true;
    }
    return false;
}

// Visszaadja egy előzmény utolsó elemét és törli azt. Az az előzménytől függ, hogy ez (A,B)->C vagy A->(B,C) alakú.
ElozmenyLista.prototype.getLastStep = function (ID, ToroljeIs) {
    var index = this.ker(ID);
    if (index != null) {
        if (this.lista[index].lepesek.length > 0) {
            var tmp = this.lista[index].lepesek[ this.lista[index].lepesek.length-1];
            if (ToroljeIs) this.lista[index].lepesek.pop();
            return tmp;
        }
    }
    return null;
}

// Megmondja, hogy Bottom-Up jellegű klaszterezésről van-e szó. Ha rossz az index null-al tér vissza.
ElozmenyLista.prototype.BottomUP = function(ID) {
    var index = this.ker(ID);
    if (index != null) {
        return this.lista[index].bottomup;
    }
    return null;
}

// Egy klasztert ad hozzá az ID -val azonosított feladat klaszterhalmazához.
ElozmenyLista.prototype.addKlaszter = function( ID, klaszter ) {
    var index = this.ker(ID);
    if (index != null) {
        this.lista[index].klaszterek.push( klaszter );
        return true;
    }
    return false;
}

// Felülírja az ID-val azonosított feladat klaszterhalmazát.
ElozmenyLista.prototype.setKlaszterek = function (ID, klaszterek) {
    var index = this.ker(ID);
    if (index != null) {
        this.lista[index].klaszterek = klaszterek;
        return true;
    }
    return false;
}

// Visszaadja az ID-val azonosított feladat klaszterhalmazát. Pl Kirajzoláshoz.
ElozmenyLista.prototype.getKlaszterek = function(ID) {
    var index = this.ker(ID);
    if (index!= null) {
        return this.lista[index].klaszterek;
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

ElozmenyLista.prototype.getKlaszterByID = function(FeladatID, KlaszterID) {
    var index = this.ker(FeladatID);
    if (index != null) {
        for (var i=0; i< this.lista[index].klaszterek.length; i++) {
            if (this.lista[index].klaszterek[i].ID == KlaszterID) {
                return this.lista[index].klaszterek[i];
            }
        }
    }
    return null;
}

ElozmenyLista.prototype.deleteKlaszterByID = function(FeladatID, KlaszterID) {
    var index = this.ker(FeladatID);
    if (index != null) {
        for (var i=0; i< this.lista[index].klaszterek.length; i++) {
            if (this.lista[index].klaszterek[i].ID == KlaszterID) {
                this.lista[index].klaszterek.splice(i,1);
                return true;
            }
        }
    }
    return false;
}