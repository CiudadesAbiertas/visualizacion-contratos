/*
Copyright 2018 Ayuntamiento de A Coruña, Ayuntamiento de Madrid, Ayuntamiento de Santiago de Compostela, Ayuntamiento de Zaragoza, Entidad Pública Empresarial Red.es

Licensed under the EUPL, Version 1.2 or – as soon they will be approved by the European Commission - subsequent versions of the EUPL (the 'Licence');
You may not use this work except in compliance with the Licence.
You may obtain a copy of the Licence at:

https://joinup.ec.europa.eu/software/page/eupl

Unless required by applicable law or agreed to in writing, software distributed under the Licence is distributed on an 'AS IS' basis,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the Licence for the specific language governing permissions and limitations under the Licence.
*/

/*
Algunas variables que se usan en este javascript se inicializan en ciudadesAbiertas.js
*/

// Estructura para saber cuando han acabado las peticiones ajax iniciales
var peticionesIniciales = [
    false,
    false,
    false,
    false,
    false,
    false,
    true,
    true,
    true,
    true,
];

/*  Variables para almacenar la información de contratos */
var processCol = [];
var organizationCol = {};
var tenderCol = [];
var awardCol = [];
var itemCol = [];
var tenderRelItemCol = [];
var categoryCol = [];
var statusCol = [];
var procedimientoCol = [];
var organismoCIdCol = [];
var organismoCIdTitleCol = [];
var anyoCol = [];
var lotCol = [];
var buyerCol = [];
var buyerTenderCol = [];
var orgContratanteColIzq = [];
var orgContratanteColDer = [];
var heightInicial;
var heightConTabla;
var orgContratanteNum = new Map();
var orgContratanteImp = new Map();
var estadosSelec = [];
var categoriaSelec = [];
var procedimientoSelec = [];
var orgContrSelec = [];
var anyoSelec = [];
var awardGroup = new Map();
var dataSet = [];
var datasetAdj = [];
var posResult = 0;
var posResultAdj = 0;
var awardNum = new Map();
var awardImp = new Map();
var awardColIzq = [];
var awardColDer = [];
var tipAdjCol = [];
var tipoContNumCol = [];
var tipoContImpCol = [];
var tipoProcNumCol = [];
var tipoProcImpCol = [];
var organismoCMap = new Map();

/*
Función de inicialización del script
*/
function inicializaBuscador() {
    if (LOG_DEGUB_BUSCADOR) {
        console.log('INFO inicializaBuscador');
    }

    
    inicializaMultidiomaBuscador();
    inicializaDatos();
}



/*
Función que iniciliza los datos que dependen de la API
*/
function inicializaDatos() {
    if (LOG_DEGUB_BUSCADOR) {
        console.log('INFO inicializaDatos');
    }

    obtieneDatosAPIProcess(dameURL(PROCESS_URL_1 + PROCESS_URL_2));
    obtieneDatosAPITender(dameURL(TENDER_URL_1 + TENDER_URL_2));
    obtieneDatosAPILot(dameURL(LOT_URL_1 + LOT_URL_2));	
    obtieneDatosAPIOrganization(dameURL(ORGANIZATION_URL_1 + ORGANIZATION_URL_2));
    obtieneDatosAPIAward(dameURL(AWARD_URL_1 + AWARD_URL_2));

    obtieneDatosAPIItem(dameURL(ITEM_URL_1 + ITEM_URL_2));
    obtieneDatosAPITenderRelItem(dameURL(TENDER_REL_ITEM_URL_1 + TENDER_REL_ITEM_URL_2));
}

/*
Función que iniciliza los datos que dependen de la API
*/
function obtieneDatosAPIProcess(url) {
    if (LOG_DEGUB_BUSCADOR) {
        console.log('INFO obtieneDatosAPIProcess | ' + url);
    }
    $.getJSON(dameURL(url))
        .done(function (data) {
            if (data && data.records && data.records.length) {
                let i;
                for (i = 0; i < data.records.length; i++) {
                    let process = {
                        id: data.records[i].id,
                        identifier: data.records[i].identifier,
                        title: data.records[i].title,
                        isBuyerFor: data.records[i].isBuyerFor,
                        hasTender: data.records[i].hasTender,
                        url: data.records[i].url,
                    };
                    processCol.push(process);

                    let buyerColAux = [];
                    if (buyerTenderCol[process.isBuyerFor]) {
                        buyerColAux = buyerTenderCol[process.isBuyerFor];
                    } else {
                        buyerCol.push(process.isBuyerFor);
                    }
                    buyerColAux.push(process.hasTender);
                    buyerTenderCol[process.isBuyerFor] = buyerColAux;
                }
                if (data.next) {
                    obtieneDatosAPIProcess(dameURL(data.next));
                } else {
                    modificaPeticionesInicialesr(0);
                }
            } else {
                console.log(MSG_ERROR_API_RES_VACIO);
            }
        })
        .fail(function (jqxhr, textStatus, error) {
            let err = textStatus + ', ' + error;
            console.error('Request Failed: ' + err);
        });
}

/*
Función que iniciliza los datos que dependen de la API
*/
function obtieneDatosAPITender(url) {
    if (LOG_DEGUB_BUSCADOR) {
        console.log('INFO obtieneDatosAPITender | ' + url);
    }

    $.getJSON(dameURL(url))
        .done(function (data) {
            if (data && data.records && data.records.length) {
                let i;
                for (i = 0; i < data.records.length; i++) {
                    let tender = {
                        id: data.records[i].id,
                        title: data.records[i].title,
                        mainProcurementCategory: data.records[i].mainProcurementCategory,
                        procurementMethod: data.records[i].procurementMethod,
                        numberOfTenderers: data.records[i].numberOfTenderers,
                        tenderStatus: data.records[i].tenderStatus,
                        valueAmount: data.records[i].valueAmount,
                        hasSupplier: data.records[i].hasSupplier,
                        periodStartDate: data.records[i].periodStartDate,
                        periodEndDate: data.records[i].periodEndDate,
                    };

                    if (tender.periodStartDate) {
                        tender.anyo = Date.parse(tender.periodStartDate).toString('yyyy');
                    } else if (tender.periodEndDate) {
                        tender.anyo = Date.parse(tender.periodEndDate).toString('yyyy');
                    } else {
                        tender.anyo = '';
                    }
                    if (tender.anyo && !anyoCol.includes(tender.anyo)) {
                        anyoCol.push(tender.anyo);
                    }

                    tenderCol[tender.id] = tender;
                }
                if (data.next) {
                    obtieneDatosAPITender(dameURL(data.next));
                } else {
                    modificaPeticionesInicialesr(1);
                }
            } else {
                console.log(MSG_ERROR_API_RES_VACIO);
            }
        })
        .fail(function (jqxhr, textStatus, error) {
            let err = textStatus + ', ' + error;
            console.error('Request Failed: ' + err);
        });
}

/*
Función que iniciliza los datos que dependen de la API
*/
function obtieneDatosAPILot(url) {
    if (LOG_DEGUB_BUSCADOR) {
        console.log('INFO obtieneDatosAPILot | ' + url);
    }
    $.getJSON(dameURL(url))
        .done(function (data) {
            if (data && data.records && data.records.length) {
                let i;
                for (i = 0; i < data.records.length; i++) {
                    let lot = {
                        id: data.records[i].id,
                        title: data.records[i].title,
                        hasSupplier: data.records[i].hasSupplier,
                        tenderId: data.records[i].tenderId,
                        valueAmount: data.records[i].valueAmount,
                        description: data.records[i].description,
                    };
                    let lotAux = [];
                    if (lotCol[lot.tenderId]) {
                        lotAux = lotCol[lot.tenderId];
                    }
                    lotAux.push(lot);
                    lotCol[lot.tenderId] = lotAux;
                }
                if (data.next) {
                    obtieneDatosAPILot(dameURL(data.next));
                } else {
                    modificaPeticionesInicialesr(2);
                }
            } else {
                console.log(MSG_ERROR_API_RES_VACIO);
            }
        })
        .fail(function (jqxhr, textStatus, error) {
            let err = textStatus + ', ' + error;
            console.error('Request Failed: ' + err);
        });
}

/*
Función que iniciliza los datos que dependen de la API
*/
function obtieneDatosAPIOrganization(url) {
    if (LOG_DEGUB_BUSCADOR) {
        console.log('INFO obtieneDatosAPIOrganization | ' + url);
    }
    $.getJSON(dameURL(url))
        .done(function (data) {
            if (data && data.records && data.records.length) {
                let i;
                for (i = 0; i < data.records.length; i++) {
                    let organization = {
                        id: data.records[i].id,
                        title: data.records[i].title,
                    };

                    organizationCol[organization.id] = organization;
                }
                if (data.next) {
                    obtieneDatosAPIOrganization(dameURL(data.next));
                } else {
                    modificaPeticionesInicialesr(3);
                }
            } else {
                console.log(MSG_ERROR_API_RES_VACIO);
            }
        })
        .fail(function (jqxhr, textStatus, error) {
            let err = textStatus + ', ' + error;
            console.error('Request Failed: ' + err);
        });
}



/*
Función que iniciliza los datos que dependen de la API
*/
function obtieneDatosAPIAward(url) {
    if (LOG_DEGUB_BUSCADOR) {
        console.log('INFO obtieneDatosAPIAward | ' + url);
    }
    $.getJSON(dameURL(url))
        .done(function (data) {
            if (data && data.records && data.records.length) {
                let i;
                for (i = 0; i < data.records.length; i++) {
                    let award = {
                        id: data.records[i].id,
                        isSupplierFor: data.records[i].isSupplierFor,
                        awardDate: data.records[i].awardDate,
                        valueAmount: data.records[i].valueAmount,
                        description: data.records[i].description,
                    };
                    awardCol[award.id] = award;
                }
                if (data.next) {
                    obtieneDatosAPIAward(dameURL(data.next));
                } else {
                    modificaPeticionesInicialesr(4);
                }
            } else {
                console.log(MSG_ERROR_API_RES_VACIO);
            }
        })
        .fail(function (jqxhr, textStatus, error) {
            let err = textStatus + ', ' + error;
            console.error('Request Failed: ' + err);
        });
}

/*
Función que iniciliza los datos que dependen de la API
*/
function obtieneDatosAPIItem(url) {
    if (LOG_DEGUB_BUSCADOR) {
        console.log('INFO obtieneDatosAPIItem | ' + url);
    }
    $.getJSON(dameURL(url))
        .done(function (data) {
            if (data && data.records && data.records.length) {
                let i;
                for (i = 0; i < data.records.length; i++) {
                    let item = {
                        id: data.records[i].id,
                        hasClassification: data.records[i].hasClassification,
                        description: data.records[i].description,
                    };
                    itemCol[item.id] = item;
                }
                if (data.next) {
                    obtieneDatosAPIItem(dameURL(data.next));
                } else {
                    modificaPeticionesInicialesr(5);
                }
            } else {
                console.log(MSG_ERROR_API_RES_VACIO);
            }
        })
        .fail(function (jqxhr, textStatus, error) {
            let err = textStatus + ', ' + error;
            console.error('Request Failed: ' + err);
        });
}

/*
Función que iniciliza los datos que dependen de la API
*/
function obtieneDatosAPITenderRelItem(url) {
    if (LOG_DEGUB_BUSCADOR) {
        console.log('INFO obtieneDatosAPITenderRelItem | ' + url);
    }
    $.getJSON(dameURL(url))
        .done(function (data) {
            if (data && data.records && data.records.length) {
                let i;
                for (i = 0; i < data.records.length; i++) {
                    let tenderRelItem = {
                        id: data.records[i].id,
                        tender: data.records[i].tender,
                        item: data.records[i].item,
                    };
                    let tenderRelItemAux = [];
                    if (tenderRelItemCol[tenderRelItem.tender]) {
                        tenderRelItemAux = tenderRelItemCol[tenderRelItem.tender];
                    }
                    tenderRelItemAux.push(tenderRelItem);
                    tenderRelItemCol[tenderRelItem.tender] = tenderRelItemAux;
                }
                if (data.next) {
                    obtieneDatosAPITenderRelItem(dameURL(data.next));
                } else {
                    modificaPeticionesInicialesr(6);
                }
            } else {
                console.log(MSG_ERROR_API_RES_VACIO);
            }
        })
        .fail(function (jqxhr, textStatus, error) {
            let err = textStatus + ', ' + error;
            console.error('Request Failed: ' + err);
        });
}


/*
Funcion que modifica un attributo del objeto taskmaster del padre (si existe)
*/
function modificaPeticionesInicialesr(attr) {
    if (LOG_DEGUB_BUSCADOR) {
        console.log('INFO modificaPeticionesInicialesr | ' + attr);
    }
    if (peticionesIniciales) {
        peticionesIniciales[attr] = true;
        checkPeticionesIniciales();
    }
}

/*
Funcion que chequea el objecto peticionesIniciales
*/
function checkPeticionesIniciales() {
    if (LOG_DEGUB_BUSCADOR) {
        console.log('INFO checkPeticionesIniciales');
    }

    if (!peticionesIniciales) {
        return false;
    }

    if (!peticionesIniciales[0]) {
        return false;
    }
    if (!peticionesIniciales[1]) {
        return false;
    }
    if (!peticionesIniciales[2]) {
        return false;
    }
    if (!peticionesIniciales[3]) {
        return false;
    }
    if (!peticionesIniciales[4]) {
        return false;
    }
    if (!peticionesIniciales[5]) {
        return false;
    }
    if (!peticionesIniciales[6]) {
        return false;
    }
    if (!peticionesIniciales[7]) {
        return false;
    }
    if (!peticionesIniciales[8]) {
        return false;
    }
    if (!peticionesIniciales[9]) {
        return false;
    }
    if (!peticionesIniciales[10]) {
        return false;
    }

    setTimeout(function () {
        insertaDatosIniciales();
    }, 0);
}

/*
Inserta en la página web los datos obtenidos de la API
*/
function insertaDatosIniciales() {
    if (LOG_DEGUB_BUSCADOR) {
        console.log('INFO insertaDatosIniciales');
    }

    ETIQUETA_TIP_CONT.forEach((value, key) => {
        $('#selectCategoria').append(
            '<div class="checkbox"><label><input type="checkbox" id="categoria' +
                key +
                '" value="' +
                key +
                '">' +
                value +
                '</label></div>'
        );
    });

    ETIQUETA_ESTADO.forEach((value, key) => {
        $('#selectEstado').append(
            '<div class="checkbox"><label><input type="checkbox" id="estado' +
                key +
                '" value="' +
                key +
                '">' +
                value +
                '</label></div>'
        );
    });

    organismoCIdTitleCol.sort(compareTitle);
    let d;
    for (d = 0; d < organismoCIdTitleCol.length; d++) {
        $('#selectNomOrgContr').append(
            '<div class="checkbox"><label id="labelNomOrgCont' +
                d +
                '"><input type="checkbox" id="checkNomOrgCont' +
                d +
                '" value="' +
                organismoCIdTitleCol[d].title +
                '">' +
                organismoCIdTitleCol[d].title +
                '</label></div>'
        );
    }

    anyoCol.sort();
    let e;
    for (e = 0; e < anyoCol.length; e++) {
        $('#selectAnyo').append(
            '<div class="checkbox"><label><input type="checkbox" id="anyo' +
                anyoCol[e] +
                '" value="' +
                anyoCol[e] +
                '">' +
                anyoCol[e] +
                '</label></div>'
        );
    }

    ETIQUETA_TIP_PROC.forEach((value, key) => {
        $('#selectProcedimiento').append(
            '<div class="checkbox"><label><input type="checkbox" id="procedimiento' +
                key +
                '" value="' +
                key +
                '">' +
                value +
                '</label></div>'
        );
    });

    preparaTablaBuscadorCont(false);
    preparaTablaBuscadorAdj(false);
    capturaParam();

    let tableCon = $('#tablaContratos').DataTable();
    tableCon.clear().draw();
    tableCon.rows.add(dataSet).draw();

    let tableAdj = $('#tablaAdjudicatarios').DataTable();
    tableAdj.clear().draw();
    tableAdj.rows.add(datasetAdj).draw();

    cambioCapaGeneral();

    $('#modalCargaInicial').modal('hide');
}

/*
Crea una estractura que será insertada en la tabla de la página web
*/



/* 
Función para inicializar el multidioma
*/
function inicializaMultidiomaBuscador() {
    if (LOG_DEGUB_BUSCADOR) {
        console.log('INFO inicializaMultidiomaBuscador');
    }
    let langUrl = getUrlVars()['lang'];
    if (!langUrl) {
        langUrl = 'es';
    }
    $.i18n().locale = langUrl;
    document.documentElement.lang = $.i18n().locale;
    $('html').i18n();

    jQuery(function ($) {
        $.i18n()
            .load({
                es: "dist/i18n/es.json",
                en: "dist/i18n/en.json",
                gl: "dist/i18n/gl.json",
            })
            .done(function () {
                $('html').i18n();
                //$('#modalIndAnuales').modal('hide');
                inicializaDatosFiltrosDatos()
				inicializaHTMLBuscador();
                preparaTablaBuscadorCont();
                preparaTablaBuscadorAdj();
            });
    });

    $.i18n.debug = LOG_DEGUB_BUSCADOR;
}

/*
Función que iniciliza los datos que dependen de la API
*/
function inicializaDatosFiltrosDatos() {
    if (LOG_DEGUB_BUSCADOR) {
        console.log('INFO inicializaDatosFiltrosDatos');
    }
	
    obtieneDatosAPICategory(dameURL(TENDER_DISTINCT_URL_1 + TENDER_DISTINCT_URL_2 + CATEGORY));
    obtieneDatosAPIStatus(dameURL(TENDER_DISTINCT_URL_1 + TENDER_DISTINCT_URL_2 + STATUS));
    obtieneDatosAPIProcedimiento(dameURL(TENDER_DISTINCT_URL_1 + TENDER_DISTINCT_URL_2 + PROCUREMENT_METHOD_DETAILS));
    obtieneDatosAPIOrganismoCId(dameURL(PROCESS_DISTINCT_URL_1 + PROCESS_DISTINCT_URL_2 + IS_BUYER_FOR));
}


/*
Función que iniciliza los datos que dependen de la API
*/
function obtieneDatosAPICategory(url) {
    if (LOG_DEGUB_BUSCADOR) {
        console.log('INFO obtieneDatosAPICategory | ' + url);
    }
    $.getJSON(dameURL(url))
        .done(function (data) {
            if (data && data.records && data.records.length) {
                let i;
                for (i = 0; i < data.records.length; i++) {
                    categoryCol.push(data.records[i]);
                }
                if (data.next) {
                    obtieneDatosAPICategory(dameURL(data.next));
                } else {
                    modificaPeticionesInicialesr(7);
                }
            } else {
                console.log(MSG_ERROR_API_RES_VACIO);
            }
        })
        .fail(function (jqxhr, textStatus, error) {
            let err = textStatus + ', ' + error;
            console.error('Request Failed: ' + err);
        });
}

function obtieneDatosAPIStatus(url) {
    if (LOG_DEGUB_BUSCADOR) {
        console.log('INFO obtieneDatosAPIStatus | ' + url);
    }
    $.getJSON(dameURL(url))
        .done(function (data) {
            if (data && data.records && data.records.length) {
                let i;
                for (i = 0; i < data.records.length; i++) {
                    statusCol.push(data.records[i]);
                }
                if (data.next) {
                    obtieneDatosAPIStatus(dameURL(data.next));
                } else {
                    modificaPeticionesInicialesr(8);
                }
            } else {
                console.log(MSG_ERROR_API_RES_VACIO);
            }
        })
        .fail(function (jqxhr, textStatus, error) {
            let err = textStatus + ', ' + error;
            console.error('Request Failed: ' + err);
        });
}

/*
Función que iniciliza los datos que dependen de la API
*/
function obtieneDatosAPIProcedimiento(url) {
    if (LOG_DEGUB_BUSCADOR) {
        console.log('INFO obtieneDatosAPIProcedimiento | ' + url);
    }
    $.getJSON(dameURL(url))
        .done(function (data) {
            if (data && data.records && data.records.length) {
                let i;
                for (i = 0; i < data.records.length; i++) {
                    procedimientoCol.push(data.records[i]);
                }
                if (data.next) {
                    obtieneDatosAPIProcedimiento(dameURL(data.next));
                } else {
                    modificaPeticionesInicialesr(9);
                }
            } else {
                console.log(MSG_ERROR_API_RES_VACIO);
            }
        })
        .fail(function (jqxhr, textStatus, error) {
            let err = textStatus + ', ' + error;
            console.error('Request Failed: ' + err);
        });
}

/*
Función que iniciliza los datos que dependen de la API
*/
function obtieneDatosAPIOrganismoCId(url) {
    if (LOG_DEGUB_BUSCADOR) {
        console.log('INFO obtieneDatosAPIOrganismoCId | ' + url);
    }
    $.getJSON(dameURL(url))
        .done(function (data) {
            if (data && data.records && data.records.length) {
                let i;
                for (i = 0; i < data.records.length; i++) {
                    organismoCIdCol.push(data.records[i]);
                }
                if (data.next) {
                    obtieneDatosAPIOrganismoCId(dameURL(data.next));
                } else {
                    modificaPeticionesInicialesr(10);
                    obtieneDatosAPIOrganismoCTitle();
                }
            } else {
                console.log(MSG_ERROR_API_RES_VACIO);
            }
        })
        .fail(function (jqxhr, textStatus, error) {
            let err = textStatus + ', ' + error;
            console.error('Request Failed: ' + err);
        });
}

/*
Función que iniciliza los datos que dependen de la API
*/
function obtieneDatosAPIOrganismoCTitle() {
    if (LOG_DEGUB_BUSCADOR) {
        console.log('INFO obtieneDatosAPIOrganismoCTitle');
    }
    let h;
    for (h = 0; h < organismoCIdCol.length; h++) {
        let organismoCId = organismoCIdCol[h];

        $.getJSON(
            dameURL(ORGANIZATION_URL_1 + '/' + organismoCId + ORGANIZATION_URL_2)
        )
            .done(function (data) {
                if (data && data.records && data.records.length) {
                    let i;
                    for (i = 0; i < data.records.length; i++) {
                        let orgCon = {
                            title : data.records[i].title,
                            titleClean : quitarAcentos(data.records[i].title)
                        }
                        organismoCIdTitleCol.push(orgCon);
                        organismoCMap.set(data.records[i].title, data.records[i].id);
                    }
                    if (data.next) {
                        obtieneDatosAPIOrganismoCId(dameURL(data.next));
                    } else {
                        modificaPeticionesInicialesr(10);
                    }
                } else {
                    console.log(MSG_ERROR_API_RES_VACIO);
                }
            })
            .fail(function (jqxhr, textStatus, error) {
                let err = textStatus + ', ' + error;
                console.error('Request Failed: ' + err);
            });
    }
    organismoCIdTitleCol.sort(compareTitle);
}


/*
Función que pinta el gráfico
*/
function pintaIndicadoresGlobales(indicadoresGlobales, div) {
    if (LOG_DEGUB_BUSCADOR) {
        console.log('INFO pintaIndicadoresGlobales');
    }

    let anyoCadena2 = $.i18n('anyos2');
    let noAdjudicatarioCadena2 = $.i18n('num_adjudicatario2');
    let importeCadena2 = $.i18n('importe_adjudicatario2');

    let chart = am4core.create(div, am4charts.XYChart);

    chart.data = indicadoresGlobales;
    chart.language.locale._decimalSeparator = ',';
    chart.language.locale._thousandSeparator = '.';

    chart.focusFilter.stroke = am4core.color("#0f0");
	chart.focusFilter.strokeWidth = 4;
    
    let categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
    categoryAxis.dataFields.category = 'anyo';
    categoryAxis.renderer.opposite = true;
    categoryAxis.title.text = anyoCadena2;

    let valueAxis2 = chart.yAxes.push(new am4charts.ValueAxis());
    let series2 = chart.series.push(new am4charts.LineSeries());
    series2.dataFields.valueY = 'numAdj';
    series2.dataFields.categoryX = 'anyo';
    series2.name = noAdjudicatarioCadena2;
    valueAxis2.title.text = noAdjudicatarioCadena2;
    series2.yAxis = valueAxis2;
    series2.strokeWidth = 3;
    series2.bullets.push(new am4charts.CircleBullet());
    series2.tooltipText = '{name} en {categoryX}: {valueY}';
    series2.legendSettings.valueText = '{valueY}';

    let valueAxis3 = chart.yAxes.push(new am4charts.ValueAxis());
    let series3 = chart.series.push(new am4charts.LineSeries());
    series3.dataFields.valueY = 'impAdj';
    series3.dataFields.categoryX = 'anyo';
    series3.name = importeCadena2;
    valueAxis3.title.text = importeCadena2;
    series3.yAxis = valueAxis3;
    series3.strokeWidth = 3;
    series3.bullets.push(new am4charts.CircleBullet());
    series3.tooltipText = '{name} en {categoryX}: {valueY}';
    series3.legendSettings.valueText = '{valueY}';

    chart.cursor = new am4charts.XYCursor();
    chart.cursor.behavior = 'zoomY';

    chart.legend = new am4charts.Legend();

    if(div=='chartdiv')
    {
        chart.exporting.menu = new am4core.ExportMenu();
        chart.exporting.menu.container = document.getElementById("exportIndAnuales");
        chart.exporting.filePrefix = 'grafico';
        chart.exporting.menu.items = [
            {
                label: "<i class='fa fa-download fa-2'></i>",
                menu: [
                    { type: "csv", label: "CSV" },
                    { type: "xlsx", label: "XLSX" },
                    { type: "json", label: "JSON" },
                ],
            },
        ];
    }
}

/*
Función que muestra u oculta la capa de la tabla de datos
*/
function mostrarDatosIndAnuales() {
    if (LOG_DEGUB_BUSCADOR) {
        console.log('INFO mostrarDatosIndAnuales');
    }

    $('#datosIndAnuales').toggle();
    if (!heightInicial) {
        heightInicial = $('#iframeBuscador', window.parent.document).height();
    }

    let isVisible = $('#datosIndAnuales').is(':visible');
    if (isVisible) {
        $('#iframeBuscador', window.parent.document).height(
            $('body').height() + 10
        );
    } else {
        if ($('.table-responsive').is(':visible')) {
            $('#iframeBuscador', window.parent.document).height(heightConTabla);
        } else {
            $('#iframeBuscador', window.parent.document).height(heightInicial);
        }
    }
}


function contruyeOrgContImp(value, key) {
    let nameCompl = key;
    let nameCorto = nameCompl.substring(0, 30);
    let numIguales = 0;
    let d;
    for(d=0;d<orgContratanteColIzq.length;d++) {
        if(orgContratanteColIzq[d].nameCorto.substring(0, 28) == nameCorto.substring(0, 28)) {
            numIguales = numIguales + 1;
        }
    }
    if(numIguales!=0) { 
        nameCorto = nameCompl.substring(0, 28) + '~' + numIguales;
    }
    let orgContratante = {
        id: organismoCMap.get(nameCompl),
        nameCompl: nameCompl,
        nameCorto: nameCorto,
        valueAmountTotal: value,
    };
    let importe = numeral(orgContratante.valueAmountTotal).format(
        importeFormato,
        Math.ceil
    );
    orgContratante.importe = importe;
    orgContratanteColIzq.push(orgContratante);
}
/*
Crea una estractura que será insertada en la tabla de la página web
*/
function datosGraficoOrgContImp() {
    if (LOG_DEGUB_BUSCADOR) {
        console.log('INFO datosGraficoOrgContImp');
    }

    let organizacionesCadena = $.i18n('organizaciones');
    let importeCadena = $.i18n('importe');
    
    let htmlContent =
        '<div class="row"><div class="col-md-12"><table style="width: 100%;"><tr><th>' +
        organizacionesCadena +
        '</th><th>' +
        importeCadena +
        '</th></tr>';
    let c;
    for (c = 0; c < orgContratanteColIzq.length; c++) {
        let orgContratanteAux = orgContratanteColIzq[c];
        htmlContent =
            htmlContent +
            '<tr>' +
            '<td>' +
            orgContratanteAux.nameCompl +
            '</td>' +
            '<td>' +
            orgContratanteAux.importe +
            '</td>' +
            '</tr>';
    }
    htmlContent =
        htmlContent +
        '</table></div></div>';
    $('#datosOrgContImp').html(htmlContent);

    pintaGraficoOrgContImp(orgContratanteColIzq.slice(0, REGISTRO_GRAFICOS), 'chartOrgContImp');
    pintaGraficoOrgContImp(orgContratanteColIzq.slice(0, REGISTRO_GRAFICOS), 'chartOrgContImp2');

}
/*
función que pinta el gráfico
*/
function pintaGraficoOrgContImp(data, div) {
    if (LOG_DEGUB_BUSCADOR) {
        console.log('INFO pintaGraficoOrgContImp');
    }

    am4core.useTheme(am4themes_frozen);

    let chart = am4core.create(div, am4charts.XYChart);
    chart.data = data;
    chart.language.locale = am4lang_es_ES;

    chart.hiddenState.properties.opacity = 0;

	chart.focusFilter.stroke = am4core.color("#0f0");
	chart.focusFilter.strokeWidth = 4;
	
    let categoryAxis = chart.yAxes.push(new am4charts.CategoryAxis());
    categoryAxis.dataFields.category = 'nameCorto';
    categoryAxis.renderer.grid.template.location = 0;
    categoryAxis.renderer.minGridDistance = 1;
    categoryAxis.renderer.inversed = true;
    categoryAxis.renderer.grid.template.disabled = true;

    let valueAxis = chart.xAxes.push(new am4charts.ValueAxis());
    valueAxis.min = 0;

    let series = chart.series.push(new am4charts.ColumnSeries());
    series.dataFields.categoryY = 'nameCorto';
    series.dataFields.valueX = 'valueAmountTotal';
    series.columns.template.properties.tooltipText = '{valueAmountTotal} €';
    series.columns.template.cursorOverStyle = am4core.MouseCursorStyle.pointer;
    series.columns.template.adapter.add('fill', function (fill, target) {
        return chart.colors.getIndex(target.dataItem.index);
    });
    series.columns.template.events.on(
        'hit',
        function (ev) {
            let url = 'fichaOrganizacionContratante.html?lang=' + $.i18n().locale;
            url =
                url +
                '&id=' +
                ev.target.dataItem.dataContext.id +
                '&capaAnterior=inicio';

            $('#iframeFichaOrganizacionContratante', window.parent.document).attr(
                'src',
                url
            );
            $('#iframeFichaOrganizacionContratante', window.parent.document).height(
                FICHAS_HEIGHT
            );

            $('#capaBuscador', window.parent.document).hide();
            $('#capaAyuda', window.parent.document).hide();
            $('#capaFichaContrato', window.parent.document).hide();
            $('#capaFichaAdjudicatario', window.parent.document).hide();
            $('#capaFichaOrganizacionContratante', window.parent.document).show();

            $('html,body', window.parent.document).scrollTop(0);
        },
        this
    );
    
    if(div=='chartOrgContImp')
    {
        chart.exporting.menu = new am4core.ExportMenu();
        chart.exporting.menu.container = document.getElementById("exportOrgContImp");
        chart.exporting.filePrefix = 'grafico';
        chart.exporting.menu.items = [
            {
                label: "<i class='fa fa-download fa-2'></i>",
                menu: [
                    { type: "csv", label: "CSV" },
                    { type: "xlsx", label: "XLSX" },
                    { type: "json", label: "JSON" },
                ],
            },
        ];
    }
}

/*
Función que muestra u oculta la capa de la tabla de datos
*/
function mostrarDatosOrgContImp() {
    if (LOG_DEGUB_BUSCADOR) {
        console.log('INFO mostrarDatosOrgContImp');
    }

    $('#datosOrgContImp').toggle();
    if (!heightInicial) {
        heightInicial = $('#iframeBuscador', window.parent.document).height();
    }

    let isVisible = $('#datosOrgContImp').is(':visible');
    if (isVisible) {
        $('#iframeBuscador', window.parent.document).height(
            $('body').height() + 10
        );
    } else {
        if ($('.table-responsive').is(':visible')) {
            $('#iframeBuscador', window.parent.document).height(heightConTabla);
        } else {
            $('#iframeBuscador', window.parent.document).height(heightInicial);
        }
    }
}

function contruyeOrgContNum(value, key) {
    let nameCompl = key;
    let nameCorto = nameCompl.substring(0, 30);
    let numIguales = 0;
    let d;
    for(d=0;d<orgContratanteColDer.length;d++) {
        if(orgContratanteColDer[d].nameCorto.substring(0, 28) == nameCorto.substring(0, 28)) {
            numIguales = numIguales + 1;
        }
    }
    if(numIguales!=0) { 
        nameCorto = nameCompl.substring(0, 28) + '~' + numIguales;
    }
    let orgContratante = {
        id: organismoCMap.get(nameCompl),
        nameCompl: nameCompl,
        nameCorto: nameCorto,
        numTotal: Number(value),
    };
    let num = numeral(value).format(numFormatoSinDecimales, Math.ceil);
    orgContratante.value = num;
    orgContratanteColDer.push(orgContratante);
}
/*
                Crea una estractura que será insertada en la tabla de la página web
*/
function datosGraficoOrgContNum() {
    if (LOG_DEGUB_BUSCADOR) {
        console.log('INFO datosGraficoOrgContNum');
    }

    orgContratanteColDer.sort(compareNum);

    let organizacionesCadena = $.i18n('organizaciones');
    let numeroContratos =  $.i18n('numero_contratos');
    
    let htmlContent =
        '<div class="row"><div class="col-md-12"><table style="width: 100%;"><tr><th>' +
        organizacionesCadena +
        '</th><th>' +
        numeroContratos +
        '</th></tr>';
    let c;
    for (c = 0; c < orgContratanteColDer.length; c++) {
        let orgContratanteAux = orgContratanteColDer[c];
        htmlContent =
            htmlContent +
            '<tr>' +
            '<td>' +
            orgContratanteAux.nameCompl +
            '</td>' +
            '<td>' +
            orgContratanteAux.value +
            '</td>' +
            '</tr>';
    }

    htmlContent =
        htmlContent +
        '</table></div></div>';
    $('#datosOrgContNum').html(htmlContent);

    pintaGraficoOrgContNum(orgContratanteColDer.slice(0, REGISTRO_GRAFICOS), 'chartOrgContNum');
    pintaGraficoOrgContNum(orgContratanteColDer.slice(0, REGISTRO_GRAFICOS), 'chartOrgContNum2');
}
/*
Función que pinta el gráfico
*/
function pintaGraficoOrgContNum(data, div) {
    if (LOG_DEGUB_BUSCADOR) {
        console.log('INFO pintaGraficoOrgContNum');
    }

    am4core.useTheme(am4themes_frozen);

    let chart = am4core.create(div, am4charts.XYChart);
    chart.data = data;
    chart.language.locale = am4lang_es_ES;

    chart.hiddenState.properties.opacity = 0;

    chart.focusFilter.stroke = am4core.color("#0f0");
	chart.focusFilter.strokeWidth = 4;

    let categoryAxis = chart.yAxes.push(new am4charts.CategoryAxis());
    categoryAxis.dataFields.category = 'nameCorto';
    categoryAxis.renderer.grid.template.location = 0;
    categoryAxis.renderer.minGridDistance = 1;
    categoryAxis.renderer.inversed = true;
    categoryAxis.renderer.grid.template.disabled = true;

    let valueAxis = chart.xAxes.push(new am4charts.ValueAxis());
    valueAxis.min = 0;

    let series = chart.series.push(new am4charts.ColumnSeries());
    series.dataFields.categoryY = 'nameCorto';
    series.dataFields.valueX = 'value';
    series.columns.template.properties.tooltipText = '{value}';
    series.columns.template.cursorOverStyle = am4core.MouseCursorStyle.pointer;
    series.columns.template.adapter.add('fill', function (fill, target) {
        return chart.colors.getIndex(target.dataItem.index);
    });
    series.columns.template.events.on(
        'hit',
        function (ev) {
            let url = 'fichaOrganizacionContratante.html?lang=' + $.i18n().locale;
            url =
                url +
                '&id=' +
                ev.target.dataItem.dataContext.id +
                '&capaAnterior=inicio';

            $('#iframeFichaOrganizacionContratante', window.parent.document).attr(
                'src',
                url
            );
            $('#iframeFichaOrganizacionContratante', window.parent.document).height(
                FICHAS_HEIGHT
            );

            $('#capaBuscador', window.parent.document).hide();
            $('#capaAyuda', window.parent.document).hide();
            $('#capaFichaContrato', window.parent.document).hide();
            $('#capaFichaAdjudicatario', window.parent.document).hide();
            $('#capaFichaOrganizacionContratante', window.parent.document).show();

            $('html,body', window.parent.document).scrollTop(0);
        },
        this
    );
    
    if(div=='chartOrgContNum')
    {
        chart.exporting.menu = new am4core.ExportMenu();
        chart.exporting.menu.container = document.getElementById("exportOrgContNum");
        chart.exporting.filePrefix = 'grafico';
        chart.exporting.menu.items = [
            {
                label: "<i class='fa fa-download fa-2'></i>",
                menu: [
                    { type: "csv", label: "CSV" },
                    { type: "xlsx", label: "XLSX" },
                    { type: "json", label: "JSON" },
                ],
            },
        ];
    }
}







/*
Función que muestra u oculta la capa de la tabla de datos
*/
function mostrarDatosOrgContNum() {
    if (LOG_DEGUB_BUSCADOR) {
        console.log('INFO mostrarDatosOrgContNum');
    }

    $('#datosOrgContNum').toggle();
    if (!heightInicial) {
        heightInicial = $('#iframeBuscador', window.parent.document).height();
    }

    let isVisible = $('#datosOrgContNum').is(':visible');
    if (isVisible) {
        $('#iframeBuscador', window.parent.document).height(
            $('body').height() + 10
        );
    } else {
        if ($('.table-responsive').is(':visible')) {
            $('#iframeBuscador', window.parent.document).height(heightConTabla);
        } else {
            $('#iframeBuscador', window.parent.document).height(heightInicial);
        }
    }
}




function contruyeDatasetAdj(value, key) {
    datasetAdj[posResultAdj] = [
        value.title,
        value.id,
        value.numAdj,
        value.impAdj,
    ];
    posResultAdj = posResultAdj + 1;
    awardNum.set(value.id, value.numAdj);
    awardImp.set(value.id, value.impAdj);
}

function contruyeAwardImp(value, key) {
    let id = key;
    let nameCompl = organizationCol[key].title;
    let nameCorto = nameCompl.substring(0, 30);
    let numIguales = 0;
    let d;
    for(d=0;d<awardColIzq.length;d++) {
        if(awardColIzq[d].nameCorto.substring(0, 28) == nameCorto.substring(0, 28)) {
            numIguales = numIguales + 1;
        }
    }
    if(numIguales!=0) { 
        nameCorto = nameCompl.substring(0, 28) + '~' + numIguales;
    }
    let award = {
        id: id,
        nameCompl: nameCompl,
        nameCorto: '',
        valueAmountTotal: value,
    };
    if (nameCompl) {
        award.nameCorto = nameCorto;
    }
    let importe = numeral(award.valueAmountTotal).format(importeFormato,Math.ceil);
    award.importe = importe;
    awardColIzq.push(award);
}
/*
                Crea una estractura que será insertada en la tabla de la página web
*/
function datosGraficoAwardImp() {
    if (LOG_DEGUB_BUSCADOR) {
        console.log('INFO datosGraficoAwardImp');
    }

    awardColIzq.sort(compareImp);

    let adjudicatariosCadena = $.i18n('adjudicatarios');
    let importeCadena = $.i18n('importe');
    
    let htmlContent =
        '<div class="row"><div class="col-md-12"><table style="width: 100%;"><tr><th>' +
        adjudicatariosCadena +
        '</th><th>' +
        importeCadena +
        '</th></tr>';
    let c;
    for (c = 0; c < awardColIzq.length; c++) {
        let awardAux = awardColIzq[c];
        htmlContent =
            htmlContent +
            '<tr>' +
            '<td>' +
            awardAux.nameCompl +
            '</td>' +
            '<td>' +
            awardAux.importe +
            '</td>' +
            '</tr>';
    }
    htmlContent =
        htmlContent +
        '</table></div></div>';
    $('#datos_subInfIzqAdj').html(htmlContent);

    pintaGraficoAwardImp(awardColIzq.slice(0, REGISTRO_GRAFICOS),'chartAdjImp');
    pintaGraficoAwardImp(awardColIzq.slice(0, REGISTRO_GRAFICOS),'chartAdjImp2');
}

/*
Función que pinta el gráfico
*/
function pintaGraficoAwardImp(data, div) {
    if (LOG_DEGUB_BUSCADOR) {
        console.log('INFO pintaGraficoAwardImp');
    }

    am4core.useTheme(am4themes_frozen);

    let chart = am4core.create(
        div,
        am4charts.XYChart
    );
    chart.data = data;
    chart.language.locale = am4lang_es_ES;

    chart.focusFilter.stroke = am4core.color("#0f0");
	chart.focusFilter.strokeWidth = 4;

    chart.hiddenState.properties.opacity = 0;

    let categoryAxis = chart.yAxes.push(new am4charts.CategoryAxis());
    categoryAxis.dataFields.category = 'nameCorto';
    categoryAxis.renderer.grid.template.location = 0;
    categoryAxis.renderer.minGridDistance = 1;
    categoryAxis.renderer.inversed = true;
    categoryAxis.renderer.grid.template.disabled = true;

    let valueAxis = chart.xAxes.push(new am4charts.ValueAxis());
    valueAxis.min = 0;

    let series = chart.series.push(new am4charts.ColumnSeries());
    series.dataFields.categoryY = 'nameCorto';
    series.dataFields.valueX = 'valueAmountTotal';
    series.columns.template.properties.tooltipText = '{valueAmountTotal} €';
    series.columns.template.cursorOverStyle = am4core.MouseCursorStyle.pointer;
    series.columns.template.adapter.add('fill', function (fill, target) {
        return chart.colors.getIndex(target.dataItem.index);
    });
    series.columns.template.events.on(
        'hit',
        function (ev) {
            let url = 'fichaAdjudicatario.html?lang=' + $.i18n().locale;
            url =
                url +
                '&id=' +
                ev.target.dataItem.dataContext.id +
                '&capaAnterior=inicio';

            $('#iframeFichaAdjudicatario', window.parent.document).attr('src', url);
            $('#iframeFichaAdjudicatario', window.parent.document).height(
                FICHAS_HEIGHT
            );

            $('#capaBuscador', window.parent.document).hide();
            $('#capaAyuda', window.parent.document).hide();
            $('#capaFichaContrato', window.parent.document).hide();
            $('#capaFichaAdjudicatario', window.parent.document).show();
            $('#capaFichaOrganizacionContratante', window.parent.document).hide();

            $('html,body', window.parent.document).scrollTop(0);
        },
        this
    );

    if(div=='chartAdjImp')
    {
        chart.exporting.menu = new am4core.ExportMenu();
        chart.exporting.menu.container = document.getElementById("exportAdjImp");
        chart.exporting.filePrefix = 'grafico';
        chart.exporting.menu.items = [
            {
                label: "<i class='fa fa-download fa-2'></i>",
                menu: [
                    { type: "csv", label: "CSV" },
                    { type: "xlsx", label: "XLSX" },
                    { type: "json", label: "JSON" },
                ],
            },
        ];
    }
}
/*
Función que muestra u oculta la capa de la tabla de datos
*/
function mostrarDatosAwardImp() {
    if (LOG_DEGUB_BUSCADOR) {
        console.log('INFO mostrarDatosAwardImp');
    }

    $('#datos_subInfIzqAdj').toggle();
    if (!heightInicial) {
        heightInicial = $('#iframeBuscador', window.parent.document).height();
    }

    let isVisible = $('#datos_subInfIzqAdj').is(':visible');
    if (isVisible) {
        $('#iframeBuscador', window.parent.document).height($('body').height());
    } else {
        if ($('.table-responsive').is(':visible')) {
            $('#iframeBuscador', window.parent.document).height(heightConTabla);
        } else {
            $('#iframeBuscador', window.parent.document).height(heightInicial);
        }
    }
}


function contruyeAwardNum(value, key) {
    let id = key;
    let nameCompl = organizationCol[key].title;
    let nameCorto = nameCompl.substring(0, 30);
    let numIguales = 0;
    let d;
    for(d=0;d<awardColDer.length;d++) {
        if(awardColDer[d].nameCorto.substring(0, 28) == nameCorto.substring(0, 28)) {
            numIguales = numIguales + 1;
        }
    }
    if(numIguales!=0) { 
        nameCorto = nameCompl.substring(0, 28) + '~' + numIguales;
    }
    let award = {
        id: id,
        nameCompl: nameCompl,
        nameCorto: '',
        numTotal: Number(value),
    };
    if (nameCompl) {
        award.nameCorto = nameCorto;
    }
    let num = numeral(value).format(numFormatoSinDecimales, Math.ceil);
    award.value = num;
    awardColDer.push(award);
}



/*
                Crea una estractura que será insertada en la tabla de la página web
*/
function datosGraficoAwardNum() {
    if (LOG_DEGUB_BUSCADOR) {
        console.log('INFO datosGraficoAwardNum');
    }

    awardColDer.sort(compareNum);

    let adjudicatariosCadena = $.i18n('adjudicatarios');
    let numeroContratos = $.i18n('numero_contratos');
    
    let htmlContent =
        '<div class="row"><div class="col-md-12"><table style="width: 100%;"><tr><th>' +
        adjudicatariosCadena +
        '</th><th>' +
        numeroContratos +
        '</th></tr>';
    let c;
    for (c = 0; c < awardColDer.length; c++) {
        let awardAux = awardColDer[c];
        htmlContent =
            htmlContent +
            '<tr>' +
            '<td>' +
            awardAux.nameCompl +
            '</td>' +
            '<td>' +
            awardAux.value +
            '</td>' +
            '</tr>';
    }

    htmlContent =
        htmlContent +
        '</table></div></div>';
    $('#datos_subInfDerAdj').html(htmlContent);

    pintaGraficoAwardNum(awardColDer.slice(0, REGISTRO_GRAFICOS),'chartAdjNum');
    pintaGraficoAwardNum(awardColDer.slice(0, REGISTRO_GRAFICOS),'chartAdjNum2');
}


/*
Función que pinta el gráfico
*/
function pintaGraficoAwardNum(data, div) {
    if (LOG_DEGUB_BUSCADOR) {
        console.log('INFO pintaGraficoAwardNum');
    }

    am4core.useTheme(am4themes_frozen);

    let chart = am4core.create(div, am4charts.XYChart);
    chart.data = data;
    chart.language.locale = am4lang_es_ES;

    chart.hiddenState.properties.opacity = 0;

    chart.focusFilter.stroke = am4core.color("#0f0");
	chart.focusFilter.strokeWidth = 4;

    let categoryAxis = chart.yAxes.push(new am4charts.CategoryAxis());
    categoryAxis.dataFields.category = 'nameCorto';
    categoryAxis.renderer.grid.template.location = 0;
    categoryAxis.renderer.minGridDistance = 1;
    categoryAxis.renderer.inversed = true;
    categoryAxis.renderer.grid.template.disabled = true;

    let valueAxis = chart.xAxes.push(new am4charts.ValueAxis());
    valueAxis.min = 0;

    let series = chart.series.push(new am4charts.ColumnSeries());
    series.dataFields.categoryY = 'nameCorto';
    series.dataFields.valueX = 'value';
    series.columns.template.properties.tooltipText = '{value}';
    series.columns.template.cursorOverStyle = am4core.MouseCursorStyle.pointer;
    series.columns.template.adapter.add('fill', function (fill, target) {
        return chart.colors.getIndex(target.dataItem.index);
    });
    series.columns.template.events.on(
        'hit',
        function (ev) {
            let url = 'fichaAdjudicatario.html?lang=' + $.i18n().locale;
            url =
                url +
                '&id=' +
                ev.target.dataItem.dataContext.id +
                '&capaAnterior=inicio';

            $('#iframeFichaAdjudicatario', window.parent.document).attr('src', url);
            $('#iframeFichaAdjudicatario', window.parent.document).height(
                FICHAS_HEIGHT
            );

            $('#capaBuscador', window.parent.document).hide();
            $('#capaAyuda', window.parent.document).hide();
            $('#capaFichaContrato', window.parent.document).hide();
            $('#capaFichaAdjudicatario', window.parent.document).show();
            $('#capaFichaOrganizacionContratante', window.parent.document).hide();

            $('html,body', window.parent.document).scrollTop(0);
        },
        this
    );

    if(div=='chartAdjNum')
    {
        chart.exporting.menu = new am4core.ExportMenu();
        chart.exporting.menu.container = document.getElementById("exportAdjNum");
        chart.exporting.filePrefix = 'grafico';
        chart.exporting.menu.items = [
            {
                label: "<i class='fa fa-download fa-2'></i>",
                menu: [
                    { type: "csv", label: "CSV" },
                    { type: "xlsx", label: "XLSX" },
                    { type: "json", label: "JSON" },
                ],
            },
        ];
    }
}



/*
Función que muestra u oculta la capa de la tabla de datos
*/
function mostrarDatosAwardNum() {
    if (LOG_DEGUB_BUSCADOR) {
        console.log('INFO mostrarDatosAwardNum');
    }

    $('#datos_subInfDerAdj').toggle();
    if (!heightInicial) {
        heightInicial = $('#iframeBuscador', window.parent.document).height();
    }

    let isVisible = $('#datos_subInfDerAdj').is(':visible');
    if (isVisible) {
        $('#iframeBuscador', window.parent.document).height($('body').height());
    } else {
        if ($('.table-responsive').is(':visible')) {
            $('#iframeBuscador', window.parent.document).height(heightConTabla);
        } else {
            $('#iframeBuscador', window.parent.document).height(heightInicial);
        }
    }
}


/*
Función que pinta el gráfico ImpContratos
*/
function pintaGraficoTipAdj(data, div) {
    if (LOG_DEGUB_BUSCADOR) {
        console.log('INFO pintaGraficoTipAdj');
    }

    am4core.useTheme(am4themes_frozen);

    let chart = am4core.create(div, am4charts.TreeMap);
    chart.data = data;
    chart.language.locale = am4lang_es_ES;
    chart.layoutAlgorithm = chart.squarify;

    chart.dataFields.value = 'importe';
    chart.dataFields.name = 'tipo';

    chart.focusFilter.stroke = am4core.color("#0f0");
	chart.focusFilter.strokeWidth = 4;

    let level1 = chart.seriesTemplates.create('0');
    let level1_column = level1.columns.template;

    level1_column.column.cornerRadius(2, 2, 2, 2);
    level1_column.stroke = am4core.color('#fff');
    level1_column.strokeWidth = 1;
    level1_column.properties.tooltipText = '{parentName} {name}: {value} €';

    let level1_bullet = level1.bullets.push(new am4charts.LabelBullet());
    level1_bullet.locationY = 0.5;
    level1_bullet.locationX = 0.5;
    level1_bullet.label.text = '{name}\n{value}€';
    level1_bullet.label.fill = am4core.color('#222');
    level1_bullet.label.truncate = false;

    level1_bullet.label.padding(4, 10, 4, 10);
    level1_bullet.label.fontSize = 20;
    level1_bullet.layout = 'absolute';
    level1_bullet.label.isMeasured = true;

    if(div=='chartTipAdj'){
    level1_bullet.events.on('ready', function (event) {
        let target = event.target;
        if (target.parent) {
            let pw = target.maxWidth;
            let ph = target.maxHeight;

            let label = target.children.getIndex(0);
            let tw = label.measuredWidth;
            let th = label.measuredHeight;

            let scale = Math.min(pw / tw, ph / th);

            if (!isNaN(scale) && scale != Infinity) {
                if (scale > LIMITE_AGRANDAR_TEXTOS_TREEMAP) {
                    scale = LIMITE_AGRANDAR_TEXTOS_TREEMAP;
                }
                target.scale = scale;
            }
            
            if (scale < LIMITE_OCULTAR_TEXTOS_TREEMAP) {
                target.disabled = true;
            }
            
        }
    });
    }
    
    if(div=='chartTipAdj')
    {
        chart.exporting.menu = new am4core.ExportMenu();
        chart.exporting.menu.container = document.getElementById("exportTipAdj");
        chart.exporting.filePrefix = 'grafico';
        chart.exporting.menu.items = [
            {
                label: "<i class='fa fa-download fa-2'></i>",
                menu: [
                    { type: "csv", label: "CSV" },
                    { type: "xlsx", label: "XLSX" },
                    { type: "json", label: "JSON" },
                ],
            },
        ];
    }

}

function contruyeTipAdjImp(value, key) {
    let data = {
        tipo: key,
        importe: value,
    };
    tipAdjCol.push(data);
}

/*
Función que muestra u oculta la capa de la tabla de datos
*/
function mostrarDatosTipAdjImp() {
    if (LOG_DEGUB_BUSCADOR) {
        console.log('INFO mostrarDatosTipAdjImp');
    }

    $('#datos_tablaTipAdj').toggle();
    if (!heightInicial) {
        heightInicial = $('#iframeBuscador', window.parent.document).height();
    }

    let isVisible = $('#datos_tablaTipAdj').is(':visible');
    if (isVisible) {
        $('#iframeBuscador', window.parent.document).height(
            $('body').height() + 10
        );
    } else {
        if ($('.table-responsive').is(':visible')) {
            $('#iframeBuscador', window.parent.document).height(heightConTabla);
        } else {
            $('#iframeBuscador', window.parent.document).height(heightInicial);
        }
    }
}

function contruyeTipoContNum(value, key) {
    let data = {
        name: ETIQUETA_TIP_CONT.get(key),
        value: value,
    };
    tipoContNumCol.push(data);
}

/*
Función que pinta el gráfico
*/
function pintaGraficoTipoContNum(importesTipos, div) {
    if (LOG_DEGUB_BUSCADOR) {
        console.log('INFO pintaGraficoTarta');
    }

    am4core.useTheme(am4themes_frozen);

    let chart = am4core.create(div, am4charts.PieChart);
    chart.data = importesTipos;
    chart.language.locale = am4lang_es_ES;

	chart.focusFilter.stroke = am4core.color("#0f0");
	chart.focusFilter.strokeWidth = 4;

    let series = chart.series.push(new am4charts.PieSeries());
    series.dataFields.value = 'value';
    series.dataFields.category = 'name';

    series.labels.template.disabled = true;
    series.ticks.template.disabled = true;

    chart.legend = new am4charts.Legend();
    chart.legend.position = 'bottom';
    chart.legend.labels.template.maxWidth = 120;
    chart.legend.labels.template.truncate = true;
    chart.legend.itemContainers.template.tooltipText = '{category}';
	
    series.legendSettings.labelText = '{name}';
    series.legendSettings.valueText = '{value}';
    series.slices.template.tooltipText = '{name}: {value}';
    series.slices.template.cursorOverStyle = am4core.MouseCursorStyle.pointer;

    if(div=='chartTipoContNum')
    {
        chart.exporting.menu = new am4core.ExportMenu();
        chart.exporting.menu.container = document.getElementById("exportTipoContNum");
        chart.exporting.filePrefix = 'grafico';
        chart.exporting.menu.items = [
            {
                label: "<i class='fa fa-download fa-2'></i>",
                menu: [
                    { type: "csv", label: "CSV" },
                    { type: "xlsx", label: "XLSX" },
                    { type: "json", label: "JSON" },
                ],
            },
        ];
    }
}

/*
Función que muestra u oculta la capa de la tabla de datos
*/
function mostrarDatosTipoContNum() {
    if (LOG_DEGUB_BUSCADOR) {
        console.log('INFO mostrarDatosTipoContNum');
    }

    $('#datos_tablaTipoContNum').toggle();
    if (!heightInicial) {
        heightInicial = $('#iframeBuscador', window.parent.document).height();
    }

    let isVisible = $('#datos_tablaTipoContNum').is(':visible');
    if (isVisible) {
        $('#iframeBuscador', window.parent.document).height(
            $('body').height() + 10
        );
    } else {
        if ($('.table-responsive').is(':visible')) {
            $('#iframeBuscador', window.parent.document).height(heightConTabla);
        } else {
            $('#iframeBuscador', window.parent.document).height(heightInicial);
        }
    }
}

function contruyeTipoContImp(value, key) {
    let data = {
        name: ETIQUETA_TIP_CONT.get(key),
        value: value,
    };
    tipoContImpCol.push(data);
}

/*
Función que pinta el gráfico
*/
function pintaGraficoTipoContImp(importesTipos, div) {
    if (LOG_DEGUB_BUSCADOR) {
        console.log('INFO pintaGraficoTipoContImp');
    }

    am4core.useTheme(am4themes_frozen);

    let chart = am4core.create(div, am4charts.PieChart);
    chart.data = importesTipos;
    chart.language.locale = am4lang_es_ES;

    let series = chart.series.push(new am4charts.PieSeries());
    series.dataFields.value = 'value';
    series.dataFields.category = 'name';

    series.labels.template.disabled = true;
    series.ticks.template.disabled = true;

    chart.focusFilter.stroke = am4core.color("#0f0");
	chart.focusFilter.strokeWidth = 4;

    chart.legend = new am4charts.Legend();
    chart.legend.position = 'bottom';
    chart.legend.labels.template.maxWidth = 120;
    chart.legend.labels.template.truncate = true;
    chart.legend.itemContainers.template.tooltipText = '{category}';

    series.legendSettings.labelText = '{name}';
    series.legendSettings.valueText = '{value}€';
    series.slices.template.tooltipText = '{name}: {value} €';
    series.slices.template.cursorOverStyle = am4core.MouseCursorStyle.pointer;

    if(div=='chartTipoContImp')
    {
        chart.exporting.menu = new am4core.ExportMenu();
        chart.exporting.menu.container = document.getElementById("exportTipoContImp");
        chart.exporting.filePrefix = 'grafico';
        chart.exporting.menu.items = [
            {
                label: "<i class='fa fa-download fa-2'></i>",
                menu: [
                    { type: "csv", label: "CSV" },
                    { type: "xlsx", label: "XLSX" },
                    { type: "json", label: "JSON" },
                ],
            },
        ];
    }
}

/*
Función que muestra u oculta la capa de la tabla de datos
*/
function mostrarDatosTipoContImp() {
    if (LOG_DEGUB_BUSCADOR) {
        console.log('INFO mostrarDatosTipoContImp');
    }

    $('#datos_tablaTipoContImp').toggle();
    if (!heightInicial) {
        heightInicial = $('#iframeBuscador', window.parent.document).height();
    }

    let isVisible = $('#datos_tablaTipoContImp').is(':visible');
    if (isVisible) {
        $('#iframeBuscador', window.parent.document).height(
            $('body').height() + 10
        );
    } else {
        if ($('.table-responsive').is(':visible')) {
            $('#iframeBuscador', window.parent.document).height(heightConTabla);
        } else {
            $('#iframeBuscador', window.parent.document).height(heightInicial);
        }
    }
}

function contruyeTipoProcNum(value, key) {
    let data = {
        name: ETIQUETA_TIP_PROC.get(key),
        value: value,
    };
    tipoProcNumCol.push(data);
}

/*
Función que pinta el gráfico
*/
function pintaGraficoTipoProcNum(importesTipos, div) {
    if (LOG_DEGUB_BUSCADOR) {
        console.log('INFO pintaGraficoTipoProcNum');
    }

    am4core.useTheme(am4themes_frozen);

    let chart = am4core.create(div, am4charts.PieChart);
    chart.data = importesTipos;
    chart.language.locale = am4lang_es_ES;

    let series = chart.series.push(new am4charts.PieSeries());
    series.dataFields.value = 'value';
    series.dataFields.category = 'name';

    series.labels.template.disabled = true;
    series.ticks.template.disabled = true;

    chart.focusFilter.stroke = am4core.color("#0f0");
	chart.focusFilter.strokeWidth = 4;

    chart.legend = new am4charts.Legend();
    chart.legend.position = 'bottom';
    chart.legend.labels.template.maxWidth = 120;
    chart.legend.labels.template.truncate = true;
    chart.legend.itemContainers.template.tooltipText = '{category}';
	
    series.legendSettings.labelText = '{name}';
    series.legendSettings.valueText = '{value}';
    series.slices.template.tooltipText = '{name}: {value}';
    series.slices.template.cursorOverStyle = am4core.MouseCursorStyle.pointer;

    if(div=='chartTipoProcNum')
    {
        chart.exporting.menu = new am4core.ExportMenu();
        chart.exporting.menu.container = document.getElementById("exportTipoProcNum");
        chart.exporting.filePrefix = 'grafico';
        chart.exporting.menu.items = [
            {
                label: "<i class='fa fa-download fa-2'></i>",
                menu: [
                    { type: "csv", label: "CSV" },
                    { type: "xlsx", label: "XLSX" },
                    { type: "json", label: "JSON" },
                ],
            },
        ];
    }
}

/*
Función que muestra u oculta la capa de la tabla de datos
*/
function mostrarDatosTipoProcNum() {
    if (LOG_DEGUB_BUSCADOR) {
        console.log('INFO mostrarDatosTipoProcNum');
    }

    $('#datos_tablaTipoProcNum').toggle();
    if (!heightInicial) {
        heightInicial = $('#iframeBuscador', window.parent.document).height();
    }

    let isVisible = $('#datos_tablaTipoProcNum').is(':visible');
    if (isVisible) {
        $('#iframeBuscador', window.parent.document).height(
            $('body').height() + 10
        );
    } else {
        if ($('.table-responsive').is(':visible')) {
            $('#iframeBuscador', window.parent.document).height(heightConTabla);
        } else {
            $('#iframeBuscador', window.parent.document).height(heightInicial);
        }
    }
}

function contruyeTipoProcImp(value, key) {
    let data = {
        name: ETIQUETA_TIP_PROC.get(key),
        value: value,
    };
    tipoProcImpCol.push(data);
}

/*
Función que pinta el gráfico
*/
function pintaGraficoTipoProcImp(importesTipos, div) {
    if (LOG_DEGUB_BUSCADOR) {
        console.log('INFO pintaGraficoTipoProcImp');
    }

    am4core.useTheme(am4themes_frozen);

    let chart = am4core.create(div, am4charts.PieChart);
    chart.data = importesTipos;
    chart.language.locale = am4lang_es_ES;

    let series = chart.series.push(new am4charts.PieSeries());
    series.dataFields.value = 'value';
    series.dataFields.category = 'name';

    series.labels.template.disabled = true;
    series.ticks.template.disabled = true;

    chart.focusFilter.stroke = am4core.color("#0f0");
	chart.focusFilter.strokeWidth = 4;

    chart.legend = new am4charts.Legend();
    chart.legend.position = 'bottom';
    chart.legend.labels.template.maxWidth = 120;
    chart.legend.labels.template.truncate = true;
    chart.legend.itemContainers.template.tooltipText = '{category}';

    series.legendSettings.labelText = '{name}';
    series.legendSettings.valueText = '{value}€';
    series.slices.template.tooltipText = '{name}: {value} €';
    series.slices.template.cursorOverStyle = am4core.MouseCursorStyle.pointer;

    if(div=='chartTipoProcImp')
    {
        chart.exporting.menu = new am4core.ExportMenu();
        chart.exporting.menu.container = document.getElementById("exportTipoProcImp");
        chart.exporting.filePrefix = 'grafico';
        chart.exporting.menu.items = [
            {
                label: "<i class='fa fa-download fa-2'></i>",
                menu: [
                    { type: "csv", label: "CSV" },
                    { type: "xlsx", label: "XLSX" },
                    { type: "json", label: "JSON" },
                ],
            },
        ];
    }
}

/*
Función que muestra u oculta la capa de la tabla de datos
*/
function mostrarDatosTipoProcImp() {
    if (LOG_DEGUB_BUSCADOR) {
        console.log('INFO mostrarDatosTipoProcImp');
    }

    $('#datos_tablaTipoProcImp').toggle();
    if (!heightInicial) {
        heightInicial = $('#iframeBuscador', window.parent.document).height();
    }

    let isVisible = $('#datos_tablaTipoProcImp').is(':visible');
    if (isVisible) {
        $('#iframeBuscador', window.parent.document).height(
            $('body').height() + 10
        );
    } else {
        if ($('.table-responsive').is(':visible')) {
            $('#iframeBuscador', window.parent.document).height(heightConTabla);
        } else {
            $('#iframeBuscador', window.parent.document).height(heightInicial);
        }
    }
}

/*
Función que invoca a todas las funciones que se realizan al inicializar el script
*/
function inicializaHTMLBuscador() {
    if (LOG_DEGUB_BUSCADOR) {
        console.log('INFO inicializaHTMLBuscador');
    }

    camposFecha();
    if (!INDICADOR_1) {
        $('#indicador1').hide();
    }
    if (!INDICADOR_2) {
        $('#indicador2').hide();
    }
    if (!INDICADOR_3) {
        $('#indicador3').hide();
    }
    if (!INDICADOR_4) {
        $('#indicador4').hide();
    }
    $('#buscarListado').click(function () {
        $("#modalCargaInicial").modal("show");
        buscar();
        this.blur();
    });
}


/*
Función que comprueba y captura si se han pasado parámetros a la web, en caso de haberlos ejecutará una búsqueda con ellos.
*/
function capturaParam() {
    if (LOG_DEGUB_BUSCADOR) {
        console.log('INFO capturaParam');
    }

    let paramId = getUrlVars()['id'];
    if (paramId) {
        $('#buscadorExpediente').val(decodeURI(paramId));
    }
    let paramNombre = getUrlVars()['nombre'];
    if (paramNombre) {
        $('#buscadorNombre').val(decodeURI(paramNombre));
    }
    let paramEstado = getUrlVars()['estado'];
    if (paramEstado) {
        $('#selectEstado').val(decodeURI(paramEstado));
    }
    let paramCategoria = getUrlVars()['categoria'];
    if (paramCategoria) {
        $('#selectCategoria').val(decodeURI(paramCategoria));
    }
    let paramProcedimiento = getUrlVars()['procedimiento'];
    if (paramProcedimiento) {
        $('#selectProcedimiento').val(decodeURI(paramProcedimiento));
    }
    let paramCPV = getUrlVars()['cpv'];
    if (paramCPV) {
        $('#buscadorCPV').val(decodeURI(paramCPV));
    }
    let paramNombreContratante = getUrlVars()['nombreContratante'];
    if (paramNombreContratante) {
        $('#selectNomOrgContr').val(decodeURI(paramNombreContratante));
    }
    let paramAdjucicatario = getUrlVars()['adjucicatario'];
    if (paramAdjucicatario) {
        $('#buscadorLicitador').val(decodeURI(paramAdjucicatario));
    }
    let paramDesdeFecha = getUrlVars()['fechaDesde'];
    if (paramDesdeFecha) {
        $('#buscadorDesdeFecha').val(decodeURI(paramDesdeFecha));
    }
    let paramHastaFecha = getUrlVars()['fechaHasta'];
    if (paramHastaFecha) {
        $('#buscadorHastaFecha').val(decodeURI(paramHastaFecha));
    }
    let paramImporteDesde = getUrlVars()['importeDesde'];
    if (paramImporteDesde) {
        $('#buscadorImporteDesde').val(decodeURI(paramImporteDesde));
    }
    let paramTipoBeneficiario = getUrlVars()['tipo'];
    if (paramTipoBeneficiario) {
        let paramCifAdjudicatario = IDENTIFICADOR_TIPO_ENTIDAD.get(
            decodeURI(paramTipoBeneficiario)
        );
        if (paramCifAdjudicatario) {
            $('#buscadorCifLicitador').val(decodeURI(paramCifAdjudicatario));
        }
    }

    buscar();
}
/*
                Funcion que realiza las busquedas en la tabla
*/
function buscar() {
    if (LOG_DEGUB_BUSCADOR) {
        console.log('INFO buscar');
    }

    orgContratanteNum = new Map();
    orgContratanteImp = new Map();
    orgContratanteColIzq = [];
    orgContratanteColDer = [];
    awardNum = new Map();
    awardImp = new Map();
    awardColIzq = [];
    awardColDer = [];
    estadosSelec = [];
    categoriaSelec = [];
    procedimientoSelec = [];
    orgContrSelec = [];
    anyoSelec = [];

    if (!heightInicial) {
        heightInicial = $('#iframeBuscador', window.parent.document).height();
    }

    let idBusqueda = $('#buscadorExpediente').val();
    let nombreBusqueda = $('#buscadorNombre').val();
    let idOrgContrBusqueda = '';
    let fechaInicioBusqueda = $('#buscadorDesdeFecha').val();
    let fechaFinBusqueda = $('#buscadorHastaFecha').val();
    let licitadorBusqueda = $('#buscadorLicitador').val();
    let CPVBusqueda = $('#buscadorCPV').val();
    let importeDesdeBusqueda = $('#buscadorImporteDesde').val();
    let importeHastaBusqueda = $('#buscadorImporteHasta').val();
    let cifLicitadorBusqueda = $('#buscadorCifLicitador').val();
    let titleOrgContrSelec = [];
    obteneValoresAnyos();
    obteneValoresEstados();
    obteneValoresCategorias();
    obteneValoresProcedimiento();
    obteneValoresOrgContr();

    creaDatasetTabla(
        idBusqueda,
        nombreBusqueda,
        anyoSelec,
        categoriaSelec,
        estadosSelec,
        idOrgContrBusqueda,
        orgContrSelec,
        fechaInicioBusqueda,
        fechaFinBusqueda,
        procedimientoSelec,
        licitadorBusqueda,
        CPVBusqueda,
        importeDesdeBusqueda,
        importeHastaBusqueda,
        cifLicitadorBusqueda
    );

    orgContratanteNum.forEach(contruyeOrgContNum);
    datosGraficoOrgContImp();
    datosGraficoOrgContNum();

    awardImp.forEach(contruyeAwardImp);
    awardNum.forEach(contruyeAwardNum);
    datosGraficoAwardImp();
    datosGraficoAwardNum();

    $("#modalCargaInicial").modal("hide");
}


/*
Función que inicializa los botones de fecha
*/
function camposFecha() {
    if (LOG_DEGUB_BUSCADOR) {
        console.log('INFO camposFecha');
    }

    $(function () {
        $('#buscadorDesdeFecha, #buscadorHastaFecha').datepicker({
            showButtonPanel: false,
            dateFormat: 'dd/mm/yy',
        });

    });
}



function quitarAcentos(cadena) {
    const acentos = {
        á: 'a',
        é: 'e',
        í: 'i',
        ó: 'o',
        ú: 'u',
        Á: 'A',
        É: 'E',
        Í: 'I',
        Ó: 'O',
        Ú: 'U',
    };
    return cadena
        .split('')
        .map((letra) => acentos[letra] || letra)
        .join('')
        .toString();
}

function quitaSeleccionAnyos() {
    let e;
    for (e = 0; e < anyoCol.length; e++) {
        $('#anyo' + anyoCol[e]).prop('checked', false);
    }
}

function obteneValoresAnyos() {
    let e;
    for (e = 0; e < anyoCol.length; e++) {
        if ($('#anyo' + anyoCol[e]).prop('checked')) {
            let anyoAux = $('#anyo' + anyoCol[e]).val();
            anyoSelec.push(anyoAux);
        }
    }
}

function quitaSeleccionEstados() {
    ETIQUETA_ESTADO.forEach((value, key) => {
        $('#estado' + key).prop('checked', false);
    });
}

function obteneValoresEstados() {
    ETIQUETA_ESTADO.forEach((value, key) => {
        if ($('#estado' + key).prop('checked')) {
            let estadoAux = $('#estado' + key).val();
            estadosSelec.push(estadoAux);
        }
    });
}

function quitaSeleccionCategorias() {
    ETIQUETA_TIP_CONT.forEach((value, key) => {
        $('#categoria' + key).prop('checked', false);
    });
}

function obteneValoresCategorias() {
    ETIQUETA_TIP_CONT.forEach((value, key) => {
        if ($('#categoria' + key).prop('checked')) {
            let categoriaAux = $('#categoria' + key).val();
            categoriaSelec.push(categoriaAux);
        }
    });
}

function quitaSeleccionProcedimiento() {
    ETIQUETA_TIP_PROC.forEach((value, key) => {
        $('#procedimiento' + key).prop('checked', false);
    });
}

function obteneValoresProcedimiento() {
    ETIQUETA_TIP_PROC.forEach((value, key) => {
        if ($('#procedimiento' + key).prop('checked')) {
            let procedimientoAux = $('#procedimiento' + key).val();
            procedimientoSelec.push(procedimientoAux);
        }
    });
}

function quitaSeleccionOrgContr() {
    let d;
    for (d = 0; d < organismoCIdTitleCol.length; d++) {
        $('#checkNomOrgCont' + d).prop('checked', false);
    }
}

function obteneValoresOrgContr() {
    let d;
    for (d = 0; d < organismoCIdTitleCol.length; d++) {
        if ($('#checkNomOrgCont' + d).prop('checked')) {
            let orgContrAux = $('#checkNomOrgCont' + d).val();
            orgContrSelec.push(orgContrAux);
        }
    }
}

function searchOrganizacion() {
    if (LOG_DEGUB_BUSCADOR) {
        console.log('INFO mostrarDatosTipoProcImp');
    }
    let organizacion = $('#buscadorNomOrgContr').val();
    if (organizacion.length >= 3) {
        let d;
        for (d = 0; d < organismoCIdTitleCol.length; d++) {
            if (
                quitarAcentos(organismoCIdTitleCol[d].title)
                    .toLowerCase()
                    .indexOf(quitarAcentos(organizacion).toLowerCase()) != -1
            ) {
                $('#checkNomOrgCont' + d).show();
                $('#labelNomOrgCont' + d).show();
                $('#checkNomOrgCont' + d).prop('checked', true);
            } else {
                $('#checkNomOrgCont' + d).hide();
                $('#labelNomOrgCont' + d).hide();
                $('#checkNomOrgCont' + d).prop('checked', false);
            }
        }
    } else {
        let d;
        for (d = 0; d < organismoCIdTitleCol.length; d++) {
            $('#checkNomOrgCont' + d).show();
            $('#labelNomOrgCont' + d).show();
            $('#checkNomOrgCont' + d).prop('checked', false);
        }
    }
}



function compareTitle (a, b) {
    if (a.titleClean < b.titleClean) return -1;
    if (b.titleClean < a.titleClean) return 1;

    return 0;
}

function compareImp(a, b) {
    if (a.valueAmountTotal > b.valueAmountTotal) return -1;
    if (b.valueAmountTotal > a.valueAmountTotal) return 1;

    return 0;
}

function compareNum(a, b) {
    if (a.numTotal > b.numTotal) return -1;
    if (b.numTotal > a.numTotal) return 1;

    return 0;
}

/*
                Función para limpiar el formulario
*/
function limpiarFormulario() {
    if (LOG_DEGUB_BUSCADOR) {
        console.log('INFO limpiarFormulario');
    }

    $('#buscadorExpediente').val('');
    $('#buscadorNombre').val('');
    $('#selectIdOrgContr').val('');
    $('#selectNomOrgContr').selectpicker('deselectAll');
    $('#buscadorHastaFecha').val('');
    $('#buscadorDesdeFecha').val('');
    $('#buscadorImporteDesde').val('');
    $('#buscadorImporteHasta').val('');
    $('#buscadorCPV').val('');
    $('#buscadorLicitador').val('');
    $('#buscadorCifLicitador').val('');
    quitaSeleccionAnyos();
    quitaSeleccionEstados();
    quitaSeleccionCategorias();
    quitaSeleccionProcedimiento();
    quitaSeleccionOrgContr();

    estadosSelec = [];
    categoriaSelec = [];
    procedimientoSelec = [];
    anyoSelec = [];

    $('#iframeBuscador', window.parent.document).height(heightInicial);
}


function selececionarTodo(capa) {
    if (LOG_DEGUB_BUSCADOR) {
        console.log('INFO selececionarTodo');
    }
    $('#' + capa + ' .checkbox label input').prop('checked', true);
}

function quitarSeleccion(capa) {
    if (LOG_DEGUB_BUSCADOR) {
        console.log('INFO quitarSeleccion');
    }
    $('#' + capa + ' .checkbox label input').prop('checked', false);
}

function creaDatasetTabla(
    idBusqueda,
    nombreBusqueda,
    anyoSelec,
    categoriaSelec,
    estadosSelec,
    idOrgContrBusqueda,
    titleOrgContrSelec,
    fechaInicioBusqueda,
    fechaFinBusqueda,
    procedimientoSelec,
    licitadorBusqueda,
    CPVBusqueda,
    importeDesdeBusqueda,
    importeHastaBusqueda,
    cifLicitadorBusqueda
) {
    if (LOG_DEGUB_BUSCADOR) {
        console.log(
            'creaDatasetTabla Buscador | ' +
                idBusqueda +
                ' , ' +
                nombreBusqueda +
                ' , ' +
                anyoSelec.toString() +
                ' , ' +
                categoriaSelec.toString() +
                ' , ' +
                estadosSelec.toString() +
                ' , ' +
                idOrgContrBusqueda +
                ' , ' +
                titleOrgContrSelec.toString() +
                ' , ' +
                fechaInicioBusqueda +
                ' , ' +
                fechaFinBusqueda +
                ' , ' +
                procedimientoSelec.toString() +
                ' , ' +
                licitadorBusqueda +
                ' , ' +
                CPVBusqueda +
                ' , ' +
                importeDesdeBusqueda +
                ' , ' +
                importeHastaBusqueda +
                ' , ' +
                cifLicitadorBusqueda
        );
    }

    posResult = 0;
    posResultAdj = 0;
    dataSet = [];
    datasetAdj = [];
    let awardGroup = new Map();
    let tipoAdjMap = new Map();
    let tipoContNum = new Map();
    let tipoContImp = new Map();
    let tipoProcNum = new Map();
    let tipoProcImp = new Map();

    tipAdjCol = [];
    tipoContNumCol = [];
    tipoContImpCol = [];
    tipoProcNumCol = [];
    tipoProcImpCol = [];

    let award;

    let numTender = 0;
    let numAward = 0;
    let impTender = 0;
    let numLot = 0;
    let impLot = 0;
    let impLotMenor = 0;
    let impLotMayor = 0;
    let numAdj = 0;
    let diezImpAwardMayor = [0];
    let numProc1 = 0;
    let numProc2 = 0;
    let numProcTotal = 0;
    let impAward = 0;
    let indicadoresTemp = {};
    let anyos = [];

    let restuadoId = true;
    let restuadoNombre = true;
    let restuadoAnyo = true;
    let restuadoCategoria = true;
    let restuadoEstado = true;
    let restuadoOrganismoCId = true;
    let restuadoOrganismoCTitle = true;
    let restuadoFechaInicio = true;
    let restuadoFechaFin = true;
    let restuadoProcedimiento = true;
    let restuadolicitador = true;
    let restuadoCPV = true;
    let restuadoImporteDesde = true;
    let restuadoImporteHasta = true;
    let restuadoCifLicitador = true;

    let tenderEncontrado = false;
    
    let idTenderContados = [];

    // Recorremos todos los procesos
    let i;
    for (i = 0; i < processCol.length; i++) {
        let id = '';
        let identifier = '';
        let nombre = '';
        let anyo = '';
        let categoria = '';
        let estado = '';
        let organismoCId = '';
        let organismoCTitle = '';
        let nlicitadores = '';

        let fechaInicio = '';
        let fechaFin = '';
        let licitador = '';
        let procedimiento = '';
        let CPV = '';
        let importePliego = '';
        let cifLicitador = '';
        award = undefined;
        let nombreLote = '';
        let importeLote = '';
        let awardValueAmount = '';
        let lotEncontrado = false;
        


        // Se inicializan las variables para saber que se está buscando
        if (idBusqueda) {
            restuadoId = false;
        }
        if (nombreBusqueda) {
            restuadoNombre = false;
        }
        if (anyoSelec.length) {
            restuadoAnyo = false;
        }
        if (categoriaSelec.length) {
            restuadoCategoria = false;
        }
        if (estadosSelec.length) {
            restuadoEstado = false;
        }
        if (idOrgContrBusqueda) {
            restuadoOrganismoCId = false;
        }
        if (titleOrgContrSelec.length) {
            restuadoOrganismoCTitle = false;
        }
        if (fechaInicioBusqueda) {
            restuadoFechaInicio = false;
        }
        if (fechaFinBusqueda) {
            restuadoFechaFin = false;
        }
        if (procedimientoSelec.length) {
            restuadoProcedimiento = false;
        }
        if (licitadorBusqueda) {
            restuadolicitador = false;
        }
        if (CPVBusqueda) {
            restuadoCPV = false;
        }
        if (importeDesdeBusqueda) {
            restuadoImporteDesde = false;
        }
        if (importeHastaBusqueda) {
            restuadoImporteHasta = false;
        }
        if (cifLicitadorBusqueda) {
            restuadoCifLicitador = false;
        }

        if (processCol[i]) {
            //Se obtiene el expediente del proceso
            if (processCol[i].id) {
                id = processCol[i].id;
                identifier = processCol[i].identifier;
                if (identifier.indexOf(idBusqueda) != -1) {
                    restuadoId = true;
                }
            }
            // Se obtiene el nombre del proceso
            if (processCol[i].title) {
                nombreCompl = processCol[i].title;
                nombre = processCol[i].title.substring(0, LIMITE_NOMBRE_CONTRATO);
                if (
                    quitarAcentos(nombre)
                        .toLowerCase()
                        .indexOf(quitarAcentos(nombreBusqueda).toLowerCase()) != -1
                ) {
                    restuadoNombre = true;
                }
            }
        }
        if (processCol[i] && tenderCol[processCol[i].hasTender]) {
            //Se obtiene el anyo del proceso
            if (tenderCol[processCol[i].hasTender].anyo) {
                anyo = tenderCol[processCol[i].hasTender].anyo;
                let l;
                for (l = 0; l < anyoSelec.length; l++) {
                    let anyoBusqueda = anyoSelec[l];
                    if (anyo == anyoBusqueda) {
                        restuadoAnyo = true;
                    }
                }
            }
            
            //Se obtiene la categoria de la licitación
            if (tenderCol[processCol[i].hasTender].mainProcurementCategory) {
                categoria = tenderCol[processCol[i].hasTender].mainProcurementCategory;
                let c;
                for (c = 0; c < categoriaSelec.length; c++) {
                    let categoriaBusqueda = categoriaSelec[c];

                    if (categoria == categoriaBusqueda) {
                        restuadoCategoria = true;
                    }
                }
            }
            //Se obtiene el estado de la licitación
            if (tenderCol[processCol[i].hasTender].tenderStatus) {
                estado = tenderCol[processCol[i].hasTender].tenderStatus;
                let l;
                for (l = 0; l < estadosSelec.length; l++) {
                    let estadoBusqueda = estadosSelec[l];

                    if (estado == estadoBusqueda) {
                        restuadoEstado = true;
                    }
                }
            }
            //Se obtiene el numero de licitadores de la licitación
            if (tenderCol[processCol[i].hasTender].numberOfTenderers) {
                nlicitadores = tenderCol[processCol[i].hasTender].numberOfTenderers;
            }

            //Se obtiene la fecha de inicio de la licitación
            if (tenderCol[processCol[i].hasTender].periodStartDate) {
                fechaInicio = tenderCol[processCol[i].hasTender].periodStartDate;
                let fechaInicioAux = Date.parse(fechaInicio).toString('yyyy-MM-dd');
                if(fechaInicioBusqueda) {
                    let fechaInicioBusquedaAux =
                    Date.parse(fechaInicioBusqueda).toString('yyyy-MM-dd');
                    if (fechaInicioAux >= fechaInicioBusquedaAux) {
                        restuadoFechaInicio = true;
                    }
                }
            }
            //Se obtiene la fecha de fin de la licitación
            if (tenderCol[processCol[i].hasTender].periodEndDate) {
                fechaFin = tenderCol[processCol[i].hasTender].periodEndDate;
                let fechaFinAux = Date.parse(fechaFin).toString('yyyy-MM-dd');
                if(fechaFinBusqueda) {
                    let fechaFinBusquedaAux =
                    Date.parse(fechaFinBusqueda).toString('yyyy-MM-dd');
                    if (fechaFinAux <= fechaFinBusquedaAux) {
                        restuadoFechaFin = true;
                    }
                }
            }
            //Se obtiene el procedimiento de la licitación
            if (tenderCol[processCol[i].hasTender].procurementMethod) {
                procedimiento = tenderCol[processCol[i].hasTender].procurementMethod;
                let l;
                for (l = 0; l < procedimientoSelec.length; l++) {
                    let procedimientoBusqueda = procedimientoSelec[l];
                    if (procedimiento == procedimientoBusqueda) {
                        restuadoProcedimiento = true;
                    }
                }
            }
            //Se obtiene el importe de la licitación
            if (tenderCol[processCol[i].hasTender].valueAmount) {
                importePliego = tenderCol[processCol[i].hasTender].valueAmount;

                if (!restuadoImporteDesde && !restuadoImporteHasta) {
                    if (
                        Number(importeDesdeBusqueda) <= Number(importePliego) &&
                        Number(importePliego) <= Number(importeHastaBusqueda)
                    ) {
                        restuadoImporteDesde = true;
                        restuadoImporteHasta = true;
                    }
                } else {
                    if (!restuadoImporteDesde) {
                        if (Number(importePliego) >= Number(importeDesdeBusqueda)) {
                            restuadoImporteDesde = true;
                        }
                    }
                    if (!restuadoImporteHasta) {
                        if (Number(importePliego) <= Number(importeHastaBusqueda)) {
                            restuadoImporteHasta = true;
                        }
                    }
                }
            }

            //Si hay licitación lo guardamos para hacer calculos de los indicadores
            tenderEncontrado = true;
        }
        if (
            tenderCol[processCol[i].hasTender].hasSupplier &&
            awardCol[tenderCol[processCol[i].hasTender].hasSupplier]
        ) {
            award = awardCol[tenderCol[processCol[i].hasTender].hasSupplier];

            if (
                awardCol[tenderCol[processCol[i].hasTender].hasSupplier].isSupplierFor
            ) {
                //Se obtiene el nombre del adjudicatario de la licitación
                if (
                    organizationCol[
                        awardCol[tenderCol[processCol[i].hasTender].hasSupplier]
                            .isSupplierFor
                    ]
                ) {
                    licitador =
                        organizationCol[
                            awardCol[tenderCol[processCol[i].hasTender].hasSupplier]
                                .isSupplierFor
                        ].title;
                    if (
                        licitadorBusqueda &&
                        quitarAcentos(licitador)
                            .toLowerCase()
                            .indexOf(quitarAcentos(licitadorBusqueda).toLowerCase()) != -1
                    ) {
                        restuadolicitador = true;
                    }
                }
                //Se obtiene el CIF del adjudicatario de la licitación
                cifLicitador =
                    awardCol[tenderCol[processCol[i].hasTender].hasSupplier]
                        .isSupplierFor;
                if (
                    cifLicitadorBusqueda &&
                    cifLicitador.indexOf(cifLicitadorBusqueda) != -1
                ) {
                    restuadoCifLicitador = true;
                }
            }
        }
        //Se obtiene el CPV de la licitación
        if (tenderRelItemCol[tenderCol[processCol[i].hasTender].id]) {
            let tenderRelItemAux =
                tenderRelItemCol[tenderCol[processCol[i].hasTender].id];
            let h;
            for (h = 0; h < tenderRelItemAux.length; h++) {
                if (tenderRelItemAux[h].item) {
                    if (itemCol[tenderRelItemAux[h].item]) {
                        CPV = itemCol[tenderRelItemAux[h].item].hasClassification;
                        if (CPV == CPVBusqueda) {
                            restuadoCPV = true;
                        }
                    }
                }
            }
        }

        if (organizationCol[processCol[i].isBuyerFor]) {
            //Se obtiene el nombre de la organizacion contratante
            if (organizationCol[processCol[i].isBuyerFor].title) {
                organismoCTitle = organizationCol[processCol[i].isBuyerFor].title;
                let o;
                for (o = 0; o < titleOrgContrSelec.length; o++) {
                    let titleOrgContr = titleOrgContrSelec[o];

                    if (organismoCTitle == titleOrgContr) {
                        restuadoOrganismoCTitle = true;
                    }
                }
            }
            //Se obtiene el ID de la organizacion contratante
            if (organizationCol[processCol[i].isBuyerFor].id) {
                organismoCId = organizationCol[processCol[i].isBuyerFor].id;
                if (organismoCId == idOrgContrBusqueda) {
                    restuadoOrganismoCId = true;
                }
            }
        }
        if (lotCol[tenderCol[processCol[i].hasTender].id]) {
            lotEncontrado = true;
            let lotAux = lotCol[tenderCol[processCol[i].hasTender].id];
            
            let restuadolicitadorAux = restuadolicitador;
            let j;
            for (j = 0; j < lotAux.length; j++) {
                if (lotAux[j].valueAmount) {
                    importeLote = lotAux[j].valueAmount;
                }
                if (lotAux[j].title) {
                    nombreLote = lotAux[j].title;
                }
                if (lotAux[j].hasSupplier) {
                    if (awardCol[lotAux[j].hasSupplier].isSupplierFor) {
                        //Se obtiene el nombre del adjudicatario del lote
                        if (
                            organizationCol[awardCol[lotAux[j].hasSupplier].isSupplierFor]
                        ) {
                            licitador =
                                organizationCol[awardCol[lotAux[j].hasSupplier].isSupplierFor]
                                    .title;
                            award = awardCol[lotAux[j].hasSupplier];
                            if (
                                quitarAcentos(licitador)
                                    .toLowerCase()
                                    .indexOf(quitarAcentos(licitadorBusqueda).toLowerCase()) != -1
                            ) {
                                restuadolicitador = true;
                            }
                        }
                        //Se obtiene el CIF del adjudicatario del lote
                        cifLicitador = awardCol[lotAux[j].hasSupplier].isSupplierFor;
                        award = awardCol[lotAux[j].hasSupplier];
                        if (cifLicitador.indexOf(cifLicitadorBusqueda) != -1) {
                            restuadoCifLicitador = true;
                        }
                    }
                }

                /* Se guardan los resultados por cada lote        */
                if (
                    restuadoId &&
                    restuadoNombre &&
                    restuadoAnyo &&
                    restuadoCategoria &&
                    restuadoEstado &&
                    restuadoOrganismoCId &&
                    restuadoOrganismoCTitle &&
                    restuadoFechaInicio &&
                    restuadoFechaFin &&
                    restuadolicitador &&
                    restuadoCPV &&
                    restuadoImporteDesde &&
                    restuadoImporteHasta &&
                    restuadoCifLicitador &&
                    restuadoProcedimiento
                ) {
                    if (award) {
                        awardValueAmount = award.valueAmount;
                    }

                    //Se almacenan los datos para mostar la tabla de contratos
                    dataSet[posResult] = [
                        identifier,
                        nombre,
                        importePliego,
                        estado,
                        categoria,
                        procedimiento,
                        organismoCTitle,
                        licitador,
                        nlicitadores,
                        organismoCId,
                        cifLicitador,
                        id,
                        awardValueAmount,
                        nombreLote,
                        importeLote,
                        nombreCompl,
                        fechaInicio
                    ];
                    posResult = posResult + 1;

                    
                    //Se calculan los indicadores del adjudicatario
                    if (award && award.isSupplierFor) {
                        let group = awardGroup.get(award.isSupplierFor);
                        if (group) {
                            group.numAdj = group.numAdj + 1;
                            group.impAdj = group.impAdj + Number(award.valueAmount);

                            //indicadores
                            numAward = numAward + 1;
                            impAward = impAward + award.valueAmount;
                        } else {
                            let group = {
                                id: award.isSupplierFor,
                                numAdj: Number(1),
                                impAdj: Number(award.valueAmount),
                            };
                            if (organizationCol[award.isSupplierFor]) {
                                group.title = organizationCol[award.isSupplierFor].title;
                            }
                            awardGroup.set(group.id, group);

                            //indicadores
                            numAward = numAward + 1;
                            impAward = impAward + award.valueAmount;
                        }

                        let indicadorGlobal;
                        if (indicadoresTemp[anyo]) {
                            indicadorGlobal = indicadoresTemp[anyo];
                        } else {
                            indicadorGlobal = {
                                numAdj: 0,
                                impAdj: 0,
                                anyo: anyo,
                            };
                            anyos.push(anyo);
                        }
                        indicadorGlobal.numAdj = indicadorGlobal.numAdj + 1;
                        indicadorGlobal.impAdj = indicadorGlobal.impAdj + award.valueAmount;
                        indicadoresTemp[anyo] = indicadorGlobal;

                        //Se calculan los datos para el gráfico tipo adjudicatario
                        let fistChar = ETIQUETA_TIPO_ENTIDAD.get(
                            award.isSupplierFor.charAt(0)
                        );
                        let map = tipoAdjMap.get(fistChar);
                        if (fistChar) {
                            if (map) {
                                tipoAdjMap.set(fistChar, map + award.valueAmount);
                            } else {
                                tipoAdjMap.set(fistChar, award.valueAmount);
                            }
                        }

                        //indicadores
                        if (procedimiento == INDICADOR_1_TIPO_PROCEDIMIENTO) {
                            numProc1 = numProc1 + 1;
                        }
                        if (procedimiento == INDICADOR_2_TIPO_PROCEDIMIENTO) {
                            numProc2 = numProc2 + 1;
                        }
                        numProcTotal = numProcTotal + 1;

                        let valueAmount = award.valueAmount;
                        let l = 0;
                        let añadido = false;
                        while (l < diezImpAwardMayor.length && !añadido) {
                            let impAwardAux = diezImpAwardMayor[l];
                            if (valueAmount > impAwardAux) {
                                let impAwardAux2;
                                let o;
                                for (o = l; o < diezImpAwardMayor.length; o++) {
                                    diezImpAwardMayor[o] = valueAmount;
                                    if (o + 1 < diezImpAwardMayor.length) {
                                        impAwardAux2 = diezImpAwardMayor[o + 1];
                                        diezImpAwardMayor[o + 1] = impAwardAux;
                                        valueAmount = impAwardAux;
                                        impAwardAux = impAwardAux2;
                                    }
                                }
                                añadido = true;
                            }
                            l = l + 1;
                        }

                        //Se calculan los indicadores de organización contratante
                        if (organismoCTitle) {
                            let num = orgContratanteNum.get(organismoCTitle);
                            if (num) {
                                num = num + 1;
                            } else {
                                num = Number(1);
                            }
                            orgContratanteNum.set(organismoCTitle, num);
                        }
                        if (organismoCTitle && award.valueAmount) {
                            let imp = orgContratanteImp.get(organismoCTitle);
                            if (imp) {
                                imp = imp + award.valueAmount;
                            } else {
                                imp = Number(award.valueAmount);
                            }
                            orgContratanteImp.set(organismoCTitle, imp);
                        }

                        // tipo de contratos
                        let numC = tipoContNum.get(categoria);
                        if (numC) {
                            tipoContNum.set(categoria, numC + 1);
                        } else {
                            tipoContNum.set(categoria, 1);
                        }
                        let impC = tipoContImp.get(categoria);
                        if (impC) {
                            tipoContImp.set(categoria, Number(impC) + Number(award.valueAmount));
                        } else {
                            tipoContImp.set(categoria, Number(award.valueAmount));
                        }

                        let numP = tipoProcNum.get(procedimiento);
                        if (numP) {
                            tipoProcNum.set(procedimiento, numP + 1);
                        } else {
                            tipoProcNum.set(procedimiento, 1);
                        }
                        let impP = tipoProcImp.get(procedimiento);
                        if (impP) {
                            tipoProcImp.set(procedimiento, Number(impP) + Number(award.valueAmount));
                        } else {
                            tipoProcImp.set(procedimiento, Number(award.valueAmount));
                        }

                    }

                    //Se calculan los indicadores de contratos
                    numLot = numLot + 1;
                    impLot = impLot + Number(importeLote);

                    if (importeLote < IMPORTE_MENOR_CONTRATOS) {
                        impLotMenor = impLotMenor + Number(importeLote);
                    }
                    if (impLotMayor < importeLote) {
                        impLotMayor = importeLote;
                    }

                    if (tenderEncontrado) {
                        if (idTenderContados.indexOf(lotAux[j].tenderId) == -1) {
                            //indicadores
                            numTender = numTender + 1;
                            impTender = impTender + Number(importePliego);
                            idTenderContados.push(lotAux[j].tenderId);
                        }
                    }

                    if (licitadorBusqueda) {
                        restuadolicitador = false;
                    }
                    if (cifLicitadorBusqueda) {
                        restuadoCifLicitador = false;
                    }
                }
            }

            if (idBusqueda) {
                restuadoId = false;
            }
            if (nombreBusqueda) {
                restuadoNombre = false;
            }
            if (anyoSelec.length) {
                restuadoAnyo = false;
            }
            if (categoriaSelec.length) {
                restuadoCategoria = false;
            }
            if (estadosSelec.length) {
                restuadoEstado = false;
            }
            if (idOrgContrBusqueda) {
                restuadoOrganismoCId = false;
            }
            if (titleOrgContrSelec.length) {
                restuadoOrganismoCTitle = false;
            }
            if (fechaInicioBusqueda) {
                restuadoFechaInicio = false;
            }
            if (fechaFinBusqueda) {
                restuadoFechaFin = false;
            }
            if (procedimientoSelec.length) {
                restuadoProcedimiento = false;
            }
            if (licitadorBusqueda) {
                restuadolicitador = false;
            }
            if (CPVBusqueda) {
                restuadoCPV = false;
            }
            if (importeDesdeBusqueda) {
                restuadoImporteDesde = false;
            }
            if (importeHastaBusqueda) {
                restuadoImporteHasta = false;
            }
            if (cifLicitadorBusqueda) {
                restuadoCifLicitador = false;
            }
        }

        if(!lotEncontrado) {
            if (
                restuadoId &&
                restuadoNombre &&
                restuadoAnyo &&
                restuadoCategoria &&
                restuadoEstado &&
                restuadoOrganismoCId &&
                restuadoOrganismoCTitle &&
                restuadoFechaInicio &&
                restuadoFechaFin &&
                restuadolicitador &&
                restuadoCPV &&
                restuadoImporteDesde &&
                restuadoImporteHasta &&
                restuadoCifLicitador &&
                restuadoProcedimiento
            ) {
                if (award) {
                    awardValueAmount = award.valueAmount;
                }

                // Tabla de contratos
                dataSet[posResult] = [
                    identifier,
                    nombre,
                    importePliego,
                    estado,
                    categoria,
                    procedimiento,
                    organismoCTitle,
                    licitador,
                    nlicitadores,
                    organismoCId,
                    cifLicitador,
                    id,
                    awardValueAmount,
                    nombreLote,
                    importeLote,
                    nombreCompl,
                    fechaInicio
                ];
                posResult = posResult + 1;

                // gráficos adjudicatarios
                if (award && award.isSupplierFor) {
                    let group = awardGroup.get(award.isSupplierFor);
                    if (group) {
                        group.numAdj = group.numAdj + 1;
                        group.impAdj = group.impAdj + Number(award.valueAmount);

                        //indicadores
                        numAward = numAward + 1;
                        impAward = impAward + award.valueAmount;
                    } else {
                        group = {
                            id: award.isSupplierFor,
                            numAdj: Number(1),
                            impAdj: Number(award.valueAmount),
                        };
                        if (organizationCol[award.isSupplierFor]) {
                            group.title = organizationCol[award.isSupplierFor].title;
                        }
                        //indicadores
                        numAward = numAward + 1;
                        impAward = impAward + award.valueAmount;
                    }
                    awardGroup.set(group.id, group);
                    
                    let indicadorGlobal;
                    if (indicadoresTemp[anyo]) {
                        indicadorGlobal = indicadoresTemp[anyo];
                    } else {
                        indicadorGlobal = {
                            numAdj: 0,
                            impAdj: 0,
                            anyo: anyo,
                        };
                        anyos.push(anyo);
                    }
                    indicadorGlobal.numAdj = indicadorGlobal.numAdj + 1;
                    indicadorGlobal.impAdj = indicadorGlobal.impAdj + award.valueAmount;
                    indicadoresTemp[anyo] = indicadorGlobal;

                    // gráfico tipo adjudicatario
                    let fistChar = ETIQUETA_TIPO_ENTIDAD.get(award.isSupplierFor.charAt(0));
                    let map = tipoAdjMap.get(fistChar);
                    if (fistChar) {
                        if (map) {
                            tipoAdjMap.set(fistChar, map + award.valueAmount);
                        } else {
                            tipoAdjMap.set(fistChar, award.valueAmount);
                        }
                    }

                    //indicadores
                    if (procedimiento == INDICADOR_1_TIPO_PROCEDIMIENTO) {
                        numProc1 = numProc1 + 1;
                    }
                    if (procedimiento == INDICADOR_2_TIPO_PROCEDIMIENTO) {
                        numProc2 = numProc2 + 1;
                    }
                    numProcTotal = numProcTotal + 1;

                    let valueAmount = award.valueAmount;
                    let l = 0;
                    let añadido = false;
                    while (l < diezImpAwardMayor.length && !añadido) {
                        let impAwardAux = diezImpAwardMayor[l];
                        if (valueAmount > impAwardAux) {
                            let impAwardAux2;
                            let o;
                            for (o = l; o < diezImpAwardMayor.length; o++) {
                                diezImpAwardMayor[o] = valueAmount;
                                if (o + 1 < diezImpAwardMayor.length) {
                                    impAwardAux2 = diezImpAwardMayor[o + 1];
                                    diezImpAwardMayor[o + 1] = impAwardAux;
                                    valueAmount = impAwardAux;
                                    impAwardAux = impAwardAux2;
                                }
                            }
                            añadido = true;
                        }
                        l = l + 1;
                    }

                    // Grafico imp org contratante
                    if (organismoCTitle && award.valueAmount) {
                        let imp = orgContratanteImp.get(organismoCTitle);
                        if (imp) {
                            imp = imp + award.valueAmount;
                        } else {
                            imp = Number(award.valueAmount);
                        }
                        orgContratanteImp.set(organismoCTitle, imp);
                    }

                    // Grafico num org contratante
                    if (organismoCTitle) {
                        let num = orgContratanteNum.get(organismoCTitle);
                        if (num) {
                            num = num + 1;
                        } else {
                            num = Number(1);
                        }
                        orgContratanteNum.set(organismoCTitle, num);
                    }

                    // tipo de contratos
                    let numC = tipoContNum.get(categoria);
                    if (numC) {
                        tipoContNum.set(categoria, numC + 1);
                    } else {
                        tipoContNum.set(categoria, 1);
                    }
                    let impC = tipoContImp.get(categoria);
                    if (impC) {
                        tipoContImp.set(categoria, Number(impC) + Number(award.valueAmount));
                    } else {
                        tipoContImp.set(categoria, Number(award.valueAmount));
                    }

                    let numP = tipoProcNum.get(procedimiento);
                    if (numP) {
                        tipoProcNum.set(procedimiento, numP + 1);
                    } else {
                        tipoProcNum.set(procedimiento, 1);
                    }
                    let impP = tipoProcImp.get(procedimiento);
                    if (impP) {
                        tipoProcImp.set(procedimiento, Number(impP) + Number(award.valueAmount));
                    } else {
                        tipoProcImp.set(procedimiento, Number(award.valueAmount));
                    }
                }

                if (tenderEncontrado) {
                    //indicadores
                    numTender = numTender + 1;
                    impTender = Number(impTender) + Number(importePliego);
                }

                numLot = numLot + 1;
                impLot = impLot + Number(importePliego);

                if (importePliego < IMPORTE_MENOR_CONTRATOS) {
                    impLotMenor = impLotMenor + Number(importePliego);
                }
                if (impLotMayor < importePliego) {
                    impLotMayor = importePliego;
                }
            }
        }
    }


    //indicadores
    let nLicitaciones = numeral(numTender);
    $('#numLicitaciones').html(nLicitaciones.format());

    let sImporteLicitaciones = numeral(impTender);
    $('#importeLicitaciones').html(
        sImporteLicitaciones.format(importeFormato, Math.ceil)
    );

    let simporteMedLicitaciones = numeral(impTender / numTender);
    $('#importeMedLicitaciones').html(
        simporteMedLicitaciones.format(importeFormato, Math.ceil)
    );

    let nAdjudicatarios = numeral(numAward);
    $('#numAdjudicatarios').html(nAdjudicatarios.format());

    let sImporteAdjudicatarios = numeral(impAward);
    $('#importeAdjudicatarios').html(
        sImporteAdjudicatarios.format(importeFormato, Math.ceil)
    );

    let simpMedAdjudicatarios = numeral(impAward / numAward);
    $('#importeMedAdjudicatarios').html(
        simpMedAdjudicatarios.format(importeFormato, Math.ceil)
    );

    let pnumProc1 = numeral((numProc1 * 100) / numProcTotal);
    $('#porcentajeProcemimento1').html(pnumProc1.format(numFormato, Math.ceil));
    $('#indTipoProcedimiento1').html(
        ETIQUETA_TIP_PROC.get(INDICADOR_1_TIPO_PROCEDIMIENTO)
    );

    let pnumProc2 = numeral((numProc2 * 100) / numProcTotal);
    $('#porcentajeProcemimento2').html(pnumProc2.format(numFormato, Math.ceil));
    $('#indTipoProcedimiento2').html(
        ETIQUETA_TIP_PROC.get(INDICADOR_2_TIPO_PROCEDIMIENTO)
    );

    let diezImpAwardMayorSuma = 0;
    let c;
    for (c = 0; c < diezImpAwardMayor.length; c++) {
        diezImpAwardMayorSuma =
            Number(diezImpAwardMayorSuma) + Number(diezImpAwardMayor[c]);
    }
    let sdiezImpAwardMayor = numeral((diezImpAwardMayorSuma * 100) / impAward);
    $('#porcentajeDiezContratosMayor').html(
        sdiezImpAwardMayor.format(numFormato, Math.ceil)
    );

    orgContratanteImp.forEach(contruyeOrgContImp);
    orgContratanteColIzq.sort(compareImp);
    if(orgContratanteColIzq.length>0) {
        $('#nombreOrgContrMayor').html(orgContratanteColIzq[0].nameCompl);
        let pOrgContrMayor = numeral(
            (orgContratanteColIzq[0].valueAmountTotal * 100) / impAward
        );
        $('#porcentajeOrgContrMayor').html(
            pOrgContrMayor.format(numFormato, Math.ceil)
        );
    }

    // gráfico tipo adjudicatario
    tipoAdjMap.forEach(contruyeTipAdjImp);
    tipAdjCol.sort(function (a, b) {
        return b.importe - a.importe;
    });

    let tipoAdjudicatarioCadena = $.i18n('tipo_adjudicatario');
    let importeCadena = $.i18n('importe');
    
    let htmlContentTipAdj =
        '<div class="row"><div class="col-md-12"><table style="width: 100%;"><tr><th>' +
        tipoAdjudicatarioCadena +
        '</th><th>' +
        importeCadena +
        '</th></tr>';
    let h;
    for (h = 0; h < tipAdjCol.length; h++) {
        let tipo = tipAdjCol[h].tipo;
        let importe = Number(tipAdjCol[h].importe);
        importe = numeral(importe);
        htmlContentTipAdj =
            htmlContentTipAdj +
            '<tr>' +
            '<td>' +
            tipo +
            '</td>' +
            '<td>' +
            importe.format(numFormato) +
            '</td>' +
            '</tr>';
    }
    htmlContentTipAdj =
        htmlContentTipAdj +
        '</table></div></div>';
    $('#datos_tablaTipAdj').html(htmlContentTipAdj);

    pintaGraficoTipAdj(tipAdjCol, 'chartTipAdj');
    pintaGraficoTipAdj(tipAdjCol, 'chartTipAdj2');

    // grafico tipo de contratos numero
    tipoContNum.forEach(contruyeTipoContNum);
    tipoContNumCol.sort(function (a, b) {
        return b.value - a.value;
    });

    let tipoCadena = $.i18n('categoria');
    let numeroContratos = $.i18n('numero_contratos');
    
    let htmlContentTipoContNum =
        '<div class="row"><div class="col-md-12"><table style="width: 100%;"><tr><th>' +
        tipoCadena +
        '</th><th>' +
        numeroContratos +
        '</th></tr>';
    let k;
    for (k = 0; k < tipoContNumCol.length; k++) {
        let name = tipoContNumCol[k].name;
        let value = Number(tipoContNumCol[k].value);
        let numero = numeral(value);
        htmlContentTipoContNum =
            htmlContentTipoContNum +
            '<tr>' +
            '<td>' +
            name +
            '</td>' +
            '<td>' +
            numero.format() +
            '</td>' +
            '</tr>';
    }
    htmlContentTipoContNum =
        htmlContentTipoContNum +
        '</table></div></div>';
    $('#datos_tablaTipoContNum').html(htmlContentTipoContNum);

    pintaGraficoTipoContNum(tipoContNumCol, 'chartTipoContNum');
    pintaGraficoTipoContNum(tipoContNumCol, 'chartTipoContNum2');

    // grafico tipo de contratos importe
    tipoContImp.forEach(contruyeTipoContImp);

    let tipoContratoCadena = $.i18n('categoria');
    let importeCadena2 = $.i18n('importe');
    
    let htmlContentTipoContImp =
        '<div class="row"><div class="col-md-12"><table style="width: 100%;"><tr><th>' +
        tipoContratoCadena +
        '</th><th>' +
        importeCadena2 +
        '</th></tr>';
    let m;
    for (m = 0; m < tipoContImpCol.length; m++) {
        let name = tipoContImpCol[m].name;
        let value = Number(tipoContImpCol[m].value);
        let importe = numeral(value).format(importeFormato, Math.ceil);
        htmlContentTipoContImp =
            htmlContentTipoContImp +
            '<tr>' +
            '<td>' +
            name +
            '</td>' +
            '<td>' +
            importe +
            '</td>' +
            '</tr>';
    }
    htmlContentTipoContImp =
        htmlContentTipoContImp +
        '</table></div></div>';
    $('#datos_tablaTipoContImp').html(htmlContentTipoContImp);

    pintaGraficoTipoContImp(tipoContImpCol, 'chartTipoContImp');
    pintaGraficoTipoContImp(tipoContImpCol, 'chartTipoContImp2');

    // grafico tipo de procedimiento numero
    tipoProcNum.forEach(contruyeTipoProcNum);
    tipoProcNumCol.sort(function (a, b) {
        return b.value - a.value;
    });

    let procedimientoCadena = $.i18n('procedimiento');
    let numeroContratos2 = $.i18n('numero_contratos');

    let htmlContentTipoProcNum =
        '<div class="row"><div class="col-md-12"><table style="width: 100%;"><tr><th>' +
        procedimientoCadena +
        '</th><th>' +
        numeroContratos2 +
        '</th></tr>';
    let n;
    for (n = 0; n < tipoContNumCol.length; n++) {
        let name = tipoContNumCol[n].name;
        let value = Number(tipoContNumCol[n].value);
        let numero = numeral(value);
        htmlContentTipoProcNum =
            htmlContentTipoProcNum +
            '<tr>' +
            '<td>' +
            name +
            '</td>' +
            '<td>' +
            numero.format() +
            '</td>' +
            '</tr>';
    }
    htmlContentTipoProcNum =
        htmlContentTipoProcNum +
        '</table></div></div>';
    $('#datos_tablaTipoProcNum').html(htmlContentTipoProcNum);

    pintaGraficoTipoProcNum(tipoProcNumCol, 'chartTipoProcNum');
    pintaGraficoTipoProcNum(tipoProcNumCol, 'chartTipoProcNum2');

    // grafico tipo de procedimiento importe
    tipoProcImp.forEach(contruyeTipoProcImp);
    tipoProcImpCol.sort(function (a, b) {
        return b.value - a.value;
    });

    let procedimientoCadena2 = $.i18n('procedimiento');
    let importeCadena3 = $.i18n('importe');
    
    let htmlContentTipoProcImp =
        '<div class="row"><div class="col-md-12"><table style="width: 100%;"><tr><th>' +
        procedimientoCadena2 +
        '</th><th>' +
        importeCadena3 +
        '</th></tr>';
    let p;
    for (p = 0; p < tipoProcImpCol.length; p++) {
        let name = tipoProcImpCol[p].name;
        let value = Number(tipoProcImpCol[p].value);
        let numero = numeral(value);
        htmlContentTipoProcImp =
            htmlContentTipoProcImp +
            '<tr>' +
            '<td>' +
            name +
            '</td>' +
            '<td>' +
            numero.format() +
            '</td>' +
            '</tr>';
    }
    htmlContentTipoProcImp =
        htmlContentTipoProcImp +
        '</table></div></div>';
    $('#datos_tablaTipoProcImp').html(htmlContentTipoProcImp);

    pintaGraficoTipoProcImp(tipoProcImpCol, 'chartTipoProcImp');
    pintaGraficoTipoProcImp(tipoProcImpCol, 'chartTipoProcImp2');

    // grafico indicadores anuales
    let anyoCadena = $.i18n('anyos');
    let noAdjudicatarioCadena = $.i18n('num_adjudicatario');
    importeCadena2 = $.i18n('importe_adjudicatario');
    let htmlContentIndAnuales =
        '<div class="row"><div class="col-md-12"><table style="width: 100%;"><tr><th>' +
        anyoCadena +
        '</th><th>' +
        noAdjudicatarioCadena +
        '</th><th>' +
        importeCadena2 +
        '</th></tr>';
    let indicadoresGlobales = [];
    let q;
    anyos.sort();
    for (h = 0; h < anyos.length; h++) {
        let anyo = anyos[h];
        let numAdj = numeral(indicadoresTemp[anyo].numAdj);
        let impAdj = numeral(indicadoresTemp[anyo].impAdj);
        indicadoresGlobales.push(indicadoresTemp[anyo]);
        htmlContentIndAnuales =
            htmlContentIndAnuales +
            '<tr>' +
            '<td>' +
            anyo +
            '</td>' +
            '<td>' +
            numAdj.format(numFormato, Math.ceil) +
            '</td>' +
            '<td>' +
            impAdj.format(importeFormato, Math.ceil) +
            '</td>' +
            '</tr>';
    }
    htmlContentIndAnuales =
        htmlContentIndAnuales +
        '</table></div></div>';
    $('#datosIndAnuales').html(htmlContentIndAnuales);
    pintaIndicadoresGlobales(indicadoresGlobales, 'chartdiv');
    pintaIndicadoresGlobales(indicadoresGlobales, 'chartdiv2');
	
	
	
    // tabla contratos
    let tableCont = $('#tablaContratos').DataTable();
    tableCont.clear().draw();
    tableCont.rows.add(dataSet).draw();

    // tabla adjudicatarios
    awardGroup.forEach(contruyeDatasetAdj);
    let tableAdj = $('#tablaAdjudicatarios').DataTable();
    tableAdj.clear().draw();
    tableAdj.rows.add(datasetAdj).draw();
}
/*
Función que inicializa la tabla de búsqueda
*/
function preparaTablaBuscadorCont(segundaPasada) {
    if (LOG_DEGUB_BUSCADOR) {
        console.log('INFO preparaTablaBuscadorCont');
    }

    let dataSet = [];
    let expedienteCadena = $.i18n("n_expediente");
    let nombreCadena = $.i18n('nombre');
    let categoriaCadena = $.i18n('categoria');
    let estadoCadena =  $.i18n('estado');
    let organismoContratanteCadena = $.i18n('organismo_contratante');
    let numeroLicitadoresCadena =  $.i18n('numero_licitadores');
    let adjudicatarioCadena =  $.i18n('adjudicatario');
    let importeCadena = $.i18n('importe');
    let procedimientoCadena = $.i18n('procedimiento');
    let copyCadena = $.i18n('copiar');
    let modificarTablaCadena = $.i18n('modificar_tabla');
    let descargarCadena = $.i18n('descargar');
    

    identificadorCadena = $.i18n('identidicador');
    let showHideCadena = $.i18n('oculta_columnas');
    let importeAdjudicadoCadena = $.i18n('importe_adjudicado');
    let nombreLoteCadena = $.i18n('nombre_lote');
    let importeLoteCadena = $.i18n('importe_lote');
    let fechaInicioCadena = $.i18n('fecha_inicio_licitacion');

    let urlLanguaje = 'vendor/datatables/i18n/' + $.i18n().locale + '.json';

    let tablaContratos = $('#tablaContratos').DataTable({
        searching: false,
        pageLength: REGISTROS_TABLA_BUSQUEDA,
        formatNumber: function (toFormat) {
            return toFormat.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
        },
        formatNumber: function (toFormat) {
            return toFormat.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
        },
        language: {
            decimal: ',',
            thousands: '.',
            url: urlLanguaje,
        },
        data: dataSet,
        order: [0, 'asc'],
        columns: [
            {
                title: expedienteCadena,
                render: function (data, type, row) {
                    return (
                        '<a id="fichaContrato" aria-label="Abrir ficha" >' + row[0] + '</a>'
                    );
                },
                className: 'details-control',
            },
            {
                title: nombreCadena,
                render: function (data, type, row) {
                    return row[1];
                },
            },
            {
                title: fechaInicioCadena,
                render: function (data, type, row) {
                    return (Date.parse(row[16])).toString('dd-MM-yyyy');
                },
            },
            {
                title: importeCadena,
                render: function (data, type, row) {
                    let num = $.fn.dataTable.render
                        .number('.', ',', 2, '', '')
                        .display(row[2]);
                    return num;
                },
            },
            {
                title: nombreLoteCadena,
                render: function (data, type, row) {
                    return row[13];
                },
            },
            {
                title: importeLoteCadena,
                render: function (data, type, row) {
                    let num = $.fn.dataTable.render
                        .number('.', ',', 2, '', '')
                        .display(row[14]);
                    return num;
                },
            },
            {
                title: estadoCadena,
                render: function (data, type, row) {
                    return ETIQUETA_ESTADO.get(row[3]);
                },
            },
            {
                title: categoriaCadena,
                render: function (data, type, row) {
                    return ETIQUETA_TIP_CONT.get(row[4]);
                },
            },
            {
                title: procedimientoCadena,
                render: function (data, type, row) {
                    return ETIQUETA_TIP_PROC.get(row[5]);
                },
            },
            {
                title: organismoContratanteCadena,
                render: function (data, type, row) {
                    return (
                        '<a id="fichaOrganizacionContratante" aria-label="Abrir ficha" >' +
                        row[6] +
                        '</a>'
                    );
                },
                className: 'details-control',
            },
            {
                title: adjudicatarioCadena,
                render: function (data, type, row) {
                    return dameCeldaAdjudicatario(row);
                },
                className: 'details-control',
            },
            {
                title: importeAdjudicadoCadena,
                render: function (data, type, row) {
                    let num = $.fn.dataTable.render
                        .number('.', ',', 2, '', '')
                        .display(row[12]);
                    return num;
                },
            },
            {
                title: numeroLicitadoresCadena,
                render: function (data, type, row) {
                    return row[8];
                },
            }
        ],
        dom: '<"row panel-footer"<"col-sm-offset-1 col-sm-5"l><"col-sm-6"B>>rt<"row"<"col-sm-offset-1 col-sm-5"fi><"col-sm-5"p>>',
        buttons: [
            {
                extend: 'colvis',
                text: modificarTablaCadena+' <span class="fa fa-angle-down"></span>',
                title: 'modificar tabla',
                className: 'btn btn-light'
            },
            {
                extend: 'collection',
                text: descargarCadena+' <span class="fa fa-angle-down"></span>',
                title: 'descargar',
                className: 'btn btn-primary',
                buttons: [
                    {
                        extend: 'csv',
                        text: 'CSV <span class="fa fa-table"></span>',
                        title: 'contratos',
                        className: 'btn btn-primary',
                        exportOptions: {
                            search: 'applied',
                            order: 'applied',
                        },
                        bom: true,
                    },
                    {
                        extend: 'excel',
                        text: 'EXCEL <span class="fa fa-file-excel-o"></span>',
                        title: '',
                        className: 'btn btn-primary',
                        exportOptions: {
                            search: 'applied',
                            order: 'applied',
                        },
                    },
                    {
                        text: 'JSON <span class="fa fa-list-alt "></span>',
                        title: 'contratos',
                        className: 'btn btn-primary',
                        exportOptions: {
                            search: 'applied',
                            order: 'applied',
                        },
                        action: function (e, dt, button, config) {
                            let data = dt.buttons.exportData();

                            $.fn.dataTable.fileSave(
                                new Blob([JSON.stringify(data)]),
                                'contratos.json'
                            );
                        },
                    },
                    {
                        text: 'PDF <span class="fa fa-file-pdf-o"></span>',
                        title: 'contratos',
                        className: 'btn btn-primary',
                        extend: 'pdfHtml5',
                        filename: 'listado_contratos',
                        orientation: 'landscape',
                        pageSize: 'A4',
                        exportOptions: {
                            search: 'applied',
                            order: 'applied',
                        },
                        customize: function (doc) {
                            doc.content.splice(0, 1);
                            let now = new Date();
                            let jsDate =
                                now.getDate() +
                                '-' +
                                (now.getMonth() + 1) +
                                '-' +
                                now.getFullYear();
                            let logo = LOGO_BASE_64;
                            doc.pageMargins = [20, 60, 20, 30];
                            doc.defaultStyle.fontSize = 7;
                            doc.styles.tableHeader.fontSize = 7;
                            doc['header'] = function () {
                                return {
                                    columns: [
                                        {
                                            image: logo,
                                            width: 96,
                                        },
                                        {
                                            alignment: 'center',
                                            fontSize: '14',
                                            text: ['Listado de contratos'],
                                        },
                                    ],
                                    margin: 20,
                                };
                            };
                            doc['footer'] = function (page, pages) {
                                return {
                                    columns: [
                                        {
                                            alignment: 'left',
                                            text: ['Creado el: ', { text: jsDate.toString() }],
                                        },
                                        {
                                            alignment: 'right',
                                            text: [
                                                'Pág. ',
                                                { text: page.toString() },
                                                ' de ',
                                                { text: pages.toString() },
                                            ],
                                        },
                                    ],
                                    margin: 20,
                                };
                            };
                            let objLayout = {};
                            objLayout['hLineWidth'] = function (i) {
                                return 0.5;
                            };
                            objLayout['vLineWidth'] = function (i) {
                                return 0.5;
                            };
                            objLayout['hLineColor'] = function (i) {
                                return '#aaa';
                            };
                            objLayout['vLineColor'] = function (i) {
                                return '#aaa';
                            };
                            objLayout['paddingLeft'] = function (i) {
                                return 4;
                            };
                            objLayout['paddingRight'] = function (i) {
                                return 4;
                            };
                            doc.content[0].layout = objLayout;
                        },
                    },
                    
                ],
            },
            {
                extend: 'collection',
                text: '...',
                title: 'otros',
                className: 'btn btn-primary',
                buttons: [
                    {
                        extend: 'copy',
                        text: copyCadena + ' <span class="fa fa-copy"></span>',
                        title: 'contratos',
                        className: 'btn btn-primary',
                        exportOptions: {
                            search: 'applied',
                            order: 'applied',
                        },
                    },
                ]
            },
        ],
        initComplete: function (settings, json) {
            heightConTabla = $('body').height();
            $('#iframeBuscador', window.parent.document).height($('body').height());
        },
        drawCallback: function (settings, json) {
            heightConTabla = $('body').height();
            $('#iframeBuscador', window.parent.document).height($('body').height());
        },
    });

    //Esta linea es para que no haya warnings en dataTables
    $.fn.dataTable.ext.errMode = 'none';

    if (!segundaPasada) {
        $('#tablaContratos tbody').on('click', 'td.details-control', function () {
            let td = $(this).closest('td').html();
            let tr = $(this).closest('tr');
            let row = tablaContratos.row(tr);

            let url;
            if (td.includes('fichaContrato')) {
                url = 'fichaContrato.html?lang=' + $.i18n().locale;
                url = url + '&id=' + row.data()[11] + '&capaAnterior=buscador';

                $('#iframeFichaContrato', window.parent.document).attr('src', url);
                $('#iframeFichaContrato', window.parent.document).height(
                    $(document).height()
                );

                $('#capaBuscador', window.parent.document).hide();
                $('#capaAyuda', window.parent.document).hide();
                $('#capaFichaContrato', window.parent.document).show();
                $('#capaFichaAdjudicatario', window.parent.document).hide();
                $('#capaFichaOrganizacionContratante', window.parent.document).hide();
            } else if (td.includes('fichaOrganizacionContratante')) {
                url = 'fichaOrganizacionContratante.html?lang=' + $.i18n().locale;
                url = url + '&id=' + row.data()[9] + '&capaAnterior=buscador';

                $('#iframeFichaOrganizacionContratante', window.parent.document).attr(
                    'src',
                    url
                );
                $('#iframeFichaOrganizacionContratante', window.parent.document).height(
                    $(document).height()
                );

                $('#capaBuscador', window.parent.document).hide();
                $('#capaAyuda', window.parent.document).hide();
                $('#capaFichaContrato', window.parent.document).hide();
                $('#capaFichaAdjudicatario', window.parent.document).hide();
                $('#capaFichaOrganizacionContratante', window.parent.document).show();
            } else if (td.includes('fichaAdjudicatario')) {
                url = 'fichaAdjudicatario.html?lang=' + $.i18n().locale;
                url = url + '&id=' + row.data()[10] + '&capaAnterior=buscador';

                $('#iframeFichaAdjudicatario', window.parent.document).attr('src', url);
                $('#iframeFichaAdjudicatario', window.parent.document).height(
                    $(document).height()
                );

                $('#capaBuscador', window.parent.document).hide();
                $('#capaAyuda', window.parent.document).hide();
                $('#capaFichaContrato', window.parent.document).hide();
                $('#capaFichaAdjudicatario', window.parent.document).show();
                $('#capaFichaOrganizacionContratante', window.parent.document).hide();
            }
        });
    }

    tablaContratos.on('column-reorder', function (e, settings, details) {
        let headerCell = $(table.column(details.to).header());
    });
}

/*
Función que inicializa la tabla de búsqueda
*/
function preparaTablaBuscadorAdj(segundaPasada) {
    if (LOG_DEGUB_BUSCADOR) {
        console.log('INFO preparaTablaBuscadorAdj');
    }

    let dataSet = [];

    let adjudicatarioNombreCadena = $.i18n('adjudicatario_nombre');
    let adjudicatarioIdCadena = $.i18n('adjudicatario_cif');
    let numeroContratosCadena = $.i18n('numero_contratos');
    let importeContratosCadena = $.i18n('importe_contratos');

    let showHideCadena = $.i18n('Oculta columnas');

    let copyCadena = $.i18n('copiar');
    let modificarTablaCadena = $.i18n('modificar_tabla');
    let descargarCadena = $.i18n('descargar');
    let urlLanguaje = 'vendor/datatables/i18n/' + $.i18n().locale + '.json';

    let tablaAdjudicatarios = $('#tablaAdjudicatarios').DataTable({
        searching: false,
        pageLength: REGISTROS_TABLA_BUSQUEDA,
        formatNumber: function (toFormat) {
            return toFormat.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
        },
        language: {
            decimal: ',',
            thousands: '.',
            url: urlLanguaje,
        },
        data: dataSet,
        order: [2, 'desc'],
        columnDefs: [
            { width: '170', targets: 0 },
            { width: '40', targets: 1 },
            { width: '1', targets: 2 },
            { width: '1', targets: 3 },
        ],
        columns: [
            {
                title: adjudicatarioNombreCadena,
                render: function (data, type, row) {
                    return (
                        '<a id="fichaAdjudicatario" aria-label="Abrir ficha" >' +
                        row[0] +
                        '</a>'
                    );
                },
                className: 'details-control',
            },
            {
                title: adjudicatarioIdCadena,
                render: function (data, type, row) {
                    return row[1];
                },
            },
            {
                title: numeroContratosCadena,
                render: function (data, type, row) {
                    return row[2];
                },
            },
            {
                title: importeContratosCadena,
                render: function (data, type, row) {
                    let num = $.fn.dataTable.render
                        .number('.', ',', 2, '', '')
                        .display(row[3]);
                    return num;
                },
            },
        ],
		dom: '<"row panel-footer"<"col-sm-offset-1 col-sm-5"l><"col-sm-6"B>>rt<"row"<"col-sm-offset-1 col-sm-5"fi><"col-sm-5"p>>',
        buttons: [
           {
                extend: 'colvis',
                text: modificarTablaCadena+' <span class="fa fa-angle-down"></span>',
                title: 'modificar tabla',
                className: 'btn btn-light'
            },
            {
                extend: 'collection',
                text: descargarCadena+' <span class="fa fa-angle-down"></span>',
                title: 'descargar',
                className: 'btn btn-primary',
                buttons: [
                    {
                        extend: 'csv',
                        text: 'CSV <span class="fa fa-table"></span>',
                        title: 'adjudicatarios',
                        className: 'btn btn-primary',
                        exportOptions: {
                            search: 'applied',
                            order: 'applied',
                        },
                        bom: true,
                    },
                    {
                        extend: 'excel',
                        text: 'EXCEL <span class="fa fa-file-excel-o"></span>',
                        title: '',
                        className: 'btn btn-primary',
                        exportOptions: {
                            search: 'applied',
                            order: 'applied',
                        },
                    },
                    {
                        text: 'JSON <span class="fa fa-list-alt "></span>',
                        title: 'adjudicatarios',
                        className: 'btn btn-primary',
                        exportOptions: {
                            search: 'applied',
                            order: 'applied',
                        },
						action: function (e, dt, button, config) {
							let data = dt.buttons.exportData();

							$.fn.dataTable.fileSave(
								new Blob([JSON.stringify(data)]),
								'contratos.json'
							);
						},
					},
					{
						text: 'PDF <span class="fa fa-file-pdf-o"></span>',
						title: 'adjudicatarios',
						className: 'btn btn-primary',
						extend: 'pdfHtml5',
						filename: 'listado_contratos',
						orientation: 'landscape',
						pageSize: 'A4',
						exportOptions: {
							search: 'applied',
							order: 'applied',
						},
						customize: function (doc) {
							doc.content.splice(0, 1);
							let now = new Date();
							let jsDate =
								now.getDate() +
								'-' +
								(now.getMonth() + 1) +
								'-' +
								now.getFullYear();
							let logo = LOGO_BASE_64;
							doc.pageMargins = [20, 60, 20, 30];
							doc.defaultStyle.fontSize = 7;
							doc.styles.tableHeader.fontSize = 7;
							doc['header'] = function () {
								return {
									columns: [
										{
											image: logo,
											width: 96,
										},
										{
											alignment: 'center',
											fontSize: '14',
											text: ['Listado de contratos'],
										},
									],
									margin: 20,
								};
							};
							doc['footer'] = function (page, pages) {
								return {
									columns: [
										{
											alignment: 'left',
											text: ['Creado el: ', { text: jsDate.toString() }],
										},
										{
											alignment: 'right',
											text: [
												'Pág. ',
												{ text: page.toString() },
												' de ',
												{ text: pages.toString() },
											],
										},
									],
									margin: 20,
								};
							};
							let objLayout = {};
							objLayout['hLineWidth'] = function (i) {
								return 0.5;
							};
							objLayout['vLineWidth'] = function (i) {
								return 0.5;
							};
							objLayout['hLineColor'] = function (i) {
								return '#aaa';
							};
							objLayout['vLineColor'] = function (i) {
								return '#aaa';
							};
							objLayout['paddingLeft'] = function (i) {
								return 4;
							};
							objLayout['paddingRight'] = function (i) {
								return 4;
							};
							doc.content[0].layout = objLayout;
                        },
                    },
                    
                ],
            },
            {
                extend: 'collection',
                text: '...',
                title: 'otros',
                className: 'btn btn-primary',
                buttons: [
                    {
                        extend: 'copy',
                        text: copyCadena + ' <span class="fa fa-copy"></span>',
                        title: 'adjudicatarios',
                        className: 'btn btn-primary',
                        exportOptions: {
                            search: 'applied',
                            order: 'applied',
                        },
                    },
                ]
            },
        ],
        initComplete: function (settings, json) {
            heightConTabla = $('body').height();
            $('#iframeBuscador', window.parent.document).height($('body').height());
        },
        drawCallback: function (settings, json) {
            heightConTabla = $('body').height();
            $('#iframeBuscador', window.parent.document).height($('body').height());
        },
    });

    //Esta linea es para que no haya warnings en dataTables
    $.fn.dataTable.ext.errMode = 'none';

    if (!segundaPasada) {
        $('#tablaAdjudicatarios tbody').on(
            'click',
            'td.details-control',
            function () {
                let td = $(this).closest('td').html();
                let tr = $(this).closest('tr');
                let row = tablaAdjudicatarios.row(tr);

                let url;
                if (td.includes('fichaAdjudicatario')) {
                    url = 'fichaAdjudicatario.html?lang=' + $.i18n().locale;
                    url = url + '&id=' + row.data()[1] + '&capaAnterior=buscador';

                    $('#iframeFichaAdjudicatario', window.parent.document).attr(
                        'src',
                        url
                    );
                    $('#iframeFichaAdjudicatario', window.parent.document).height(
                        $(document).height()
                    );

                    $('#capaBuscador', window.parent.document).hide();
                    $('#capaAyuda', window.parent.document).hide();
                    $('#capaFichaContrato', window.parent.document).hide();
                    $('#capaFichaAdjudicatario', window.parent.document).show();
                    $('#capaFichaOrganizacionContratante', window.parent.document).hide();
                }
            }
        );
    }

    tablaAdjudicatarios.on('column-reorder', function (e, settings, details) {
        let headerCell = $(table.column(details.to).header());
    });
}

function dameCeldaAdjudicatario(row) {
    let resultado = '';

    if (row[7] == 'Varios' || !row[7]) {
        resultado = row[7];
    } else {
        resultado =
            '<a id="fichaAdjudicatario" aria-label="Abrir ficha" >' + row[7] + '</a>';
    }
    return resultado;
}





/*
cambioCapaGeneral
*/
function cambioCapaGeneral() {
    if (LOG_DEGUB_BUSCADOR) {
        console.log('INFO cambioCapaGeneral');
    }

    $('#capaGeneral').show();
    $('#capaLicitaciones').hide();
    $('#capaAdjudicatarios').hide();

    $('#liGeneral').css('border-bottom', '2px solid #006aa0');
    $('#buttonGeneral').css('font-weight', 'bold');
    $('#liLicitaciones').css('border-bottom', '2px solid #eaeaea');
    $('#buttonLicitaciones').css('font-weight', 'normal');
    $('#liAdjudicatarios').css('border-bottom', '2px solid #eaeaea');
    $('#buttonAdjudicatarios').css('font-weight', 'normal');

    $('#iframeBuscador', window.parent.document).height(1978);
    heightInicial = 1978;
}

/*
cambioCapacLicitaciones
*/
function cambioCapacLicitaciones() {
    if (LOG_DEGUB_BUSCADOR) {
        console.log('INFO cambioCapacLicitaciones');
    }

    $('#capaGeneral').hide();
    $('#capaLicitaciones').show();
    $('#capaAdjudicatarios').hide();

    $('#liGeneral').css('border-bottom', '2px solid #eaeaea');
    $('#buttonGeneral').css('font-weight', 'normal');
    $('#liLicitaciones').css('border-bottom', '2px solid #006aa0');
    $('#buttonLicitaciones').css('font-weight', 'bold');
    $('#liAdjudicatarios').css('border-bottom', '2px solid #eaeaea');
    $('#buttonAdjudicatarios').css('font-weight', 'normal');

    $('#iframeBuscador', window.parent.document).height(3603);
    heightInicial = 3603;
}

/*
cambioCapaAdjudicatarios
*/
function cambioCapaAdjudicatarios() {
    if (LOG_DEGUB_BUSCADOR) {
        console.log('INFO cambioCapaAdjudicatarios');
    }

    $('#capaGeneral').hide();
    $('#capaLicitaciones').hide();
    $('#capaAdjudicatarios').show();

    $('#liGeneral').css('border-bottom', '2px solid #eaeaea');
    $('#buttonGeneral').css('font-weight', 'normal');
    $('#liLicitaciones').css('border-bottom', '2px solid #eaeaea');
    $('#buttonLicitaciones').css('font-weight', 'normal');
    $('#liAdjudicatarios').css('border-bottom', '2px solid #006aa0');
    $('#buttonAdjudicatarios').css('font-weight', 'bold');

    $('#iframeBuscador', window.parent.document).height(1563);
    heightInicial = 1563;
}
