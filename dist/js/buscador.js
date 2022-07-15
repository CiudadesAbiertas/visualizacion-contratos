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
    false,
    true,
    true,
    true,
    true,
];

var indicadoresLicitaciones = [
    false,
    false,
];

var indicadoresAdjudicaciones = [
    false,
    false,
];

/*  Variables para almacenar la información de contratos */
var processCol = [];
var organizationCol = {};
var tenderCol = [];
var tenderSupplierCol = [];
var awardCol = [];
var awardLotCol = [];
var awardLicCol = [];
var itemCol = [];
var tenderRelItemCol = [];
var categoryCol = [];
var statusCol = [];
var procedimientoCol = [];
var organismoCIdCol = [];
var organismoCIdTitleCol = [];
var anyoCol = [];
var lotCol = [];
var lotSupplierCol = [];
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
var impLic = 0;
var numLic = 0;
var impAdj = 0;
var numAdj = 0;
var indicadoresAnualTemp = {};
var indicadoresAnualGlobales = [];
var awardAdjImp = [];
var awardAdjNum = [];
var awardEnTenderSet = new Set();

$(document).ready(function () {
    $('#buscarListado').click(function () {

        $(document).ready(function () {
            $('#modalCargaInicial').modal('show');
        });


    });
});

/*
Función de inicialización del script
*/
function inicializaBuscador() {
    if (LOG_DEGUB_BUSCADOR) {
        console.time('inicializaBuscador');
        console.log('inicializaBuscador');
    }

    inicializaMultidiomaBuscador();

    if (LOG_DEGUB_BUSCADOR) {
        console.timeEnd('inicializaBuscador');
    }
}

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
                es: 'dist/i18n/es.json',
                en: 'dist/i18n/en.json',
                gl: 'dist/i18n/gl.json',
            })
            .done(function () {
                $('html').i18n();
                $('#modalIndAnuales').modal('hide');
                inicializaHTMLBuscador();
                preparaTablaBuscadorCont();
                preparaTablaBuscadorAdj();
            });
    });

    $.i18n.debug = LOG_DEGUB_BUSCADOR;
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
        $('#indicador1GI').hide();
    }
    if (!INDICADOR_2) {
        $('#indicador2').hide();
        $('#indicador2GI').hide();
    }
    if (!INDICADOR_3) {
        $('#indicador3').hide();
        $('#indicador3GI').hide();
    }
    if (!INDICADOR_4) {
        $('#indicador4').hide();
        $('#indicador4GI').hide();
    }
    inicializaDatos();
}

/*
Función que llama a la funcion buscar
*/
function searchWithFilters(obj) {
    if (LOG_DEGUB_BUSCADOR) {
        console.log('INFO searchWithFilters');
    }

    setTimeout(function () {
        buscar();
        obj.blur();
    }, 300);
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

        $('#botonDesde').click(function () {
            if ($('#buscadorDesdeFecha').datepicker('widget').is(':visible')) {
                $('#buscadorDesdeFecha').datepicker('hide');
            } else {
                $('#buscadorDesdeFecha').datepicker('show');
            }
        });

        $('#botonHasta').click(function () {
            if ($('#buscadorHastaFecha').datepicker('widget').is(':visible')) {
                $('#buscadorHastaFecha').datepicker('hide');
            } else {
                $('#buscadorHastaFecha').datepicker('show');
            }
        });
    });
}

/*
Función que iniciliza los datos que dependen de la API
*/
function inicializaDatos() {
    if (LOG_DEGUB_BUSCADOR) {
        console.time('inicializaDatos');
        console.log('inicializaDatos');
    }
    inicializaDatosResumen();
    inicializaDatosFiltrosDatos();

    obtieneDatosAPIProcess(dameURL(PROCESS_URL_1 + PROCESS_URL_2));
    obtieneDatosAPITender(dameURL(TENDER_URL_1 + TENDER_URL_2));
    obtieneDatosAPILot(dameURL(LOT_URL_1 + LOT_URL_2));
    obtieneDatosAPIAward(dameURL(AWARD_URL_1 + AWARD_URL_2));
    obtieneDatosAPIOrganization(dameURL(ORGANIZATION_URL_1 + ORGANIZATION_URL_2));
    obtieneDatosAPIItem(dameURL(ITEM_URL_1 + ITEM_URL_2));
    obtieneDatosAPITenderRelItem(dameURL(TENDER_REL_ITEM_URL_1 + TENDER_REL_ITEM_URL_2));

    if (LOG_DEGUB_BUSCADOR) {
        console.timeEnd('inicializaDatos');
    }
}

function inicializaDatosResumen() {
    if (LOG_DEGUB_BUSCADOR) {
        console.time('inicializaDatosResumen');
        console.log('inicializaDatosResumen');
    }

    obtieneDatoIndicadorNumLicitaciones(INDICADOR_NUM_LICITACONES_URL);
    obtieneDatoIndicadorImpLicitaciones(INDICADOR_IMP_LICITACONES_URL);
    obtieneDatoIndicadorNumAdjudicaciones(INDICADOR_NUM_ADJUDICACIONES_URL);
    obtieneDatoIndicadorImpAdjudicaciones(INDICADOR_IMP_ADJUDICACIONES_URL);
    obtieneDatoIndicadorNumAnual(INDICADOR_NUM_ANUAL);
    obtieneDatoGrafAdjImp(GRAFICA_ADJUDICATARIO_IMP_URL);
    obtieneDatoGrafAdjNum(GRAFICA_ADJUDICATARIO_NUM_URL);
    obtieneDatoGrafTipAdj(GRAFICA_TIPO_ADJUDICATARIO_URL)

    if (LOG_DEGUB_BUSCADOR) {
        console.timeEnd('inicializaDatosResumen');
    }
}

/*
Función que iniciliza los datos que dependen de la API
*/
function obtieneDatosAPIProcess(url) {
    if (LOG_DEGUB_BUSCADOR) {
        console.time('obtieneDatosAPIProcess');
        console.log('obtieneDatosAPIProcess | ' + url);

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
                    if (LOG_DEGUB_BUSCADOR) {
                        console.timeEnd('obtieneDatosAPIProcess');
                    }
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
        console.time('obtieneDatosAPITender');
        console.log('obtieneDatosAPITender | ' + url);
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

                    if (tender.hasSupplier) {
                        let tenderAux = [];
                        if (tenderSupplierCol[tender.hasSupplier]) {
                            tenderAux = tenderSupplierCol[tender.hasSupplier];
                        }
                        tenderAux.push(tender);
                        tenderSupplierCol[tender.hasSupplier] = tenderAux;
                    }
                }
                if (data.next) {
                    obtieneDatosAPITender(dameURL(data.next));
                } else {
                    if (LOG_DEGUB_BUSCADOR) {
                        console.timeEnd('obtieneDatosAPITender');
                    }
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
        console.time('obtieneDatosAPILot');
        console.log('obtieneDatosAPILot | ' + url);
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

                    if (lot.hasSupplier) {
                        let lotAux2 = [];
                        if (lotSupplierCol[lot.hasSupplier]) {
                            lotAux2 = lotSupplierCol[lot.hasSupplier];
                        }
                        lotAux2.push(lot);
                        lotSupplierCol[lot.hasSupplier] = lotAux;
                    }
                }
                if (data.next) {
                    obtieneDatosAPILot(dameURL(data.next));
                } else {
                    if (LOG_DEGUB_BUSCADOR) {
                        console.timeEnd('obtieneDatosAPILot');
                    }
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
        console.time('obtieneDatosAPIOrganization');
        console.log('obtieneDatosAPIOrganization | ' + url);
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
                    if (LOG_DEGUB_BUSCADOR) {
                        console.timeEnd('obtieneDatosAPIOrganization');
                    }
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
        console.time('obtieneDatosAPIAward');
        console.log('obtieneDatosAPIAward | ' + url);
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
                    if (award.awardDate) {
                        award.anyo = Date.parse(award.awardDate).toString('yyyy');
                    }

                }
                if (data.next) {
                    obtieneDatosAPIAward(dameURL(data.next));
                } else {
                    if (LOG_DEGUB_BUSCADOR) {
                        console.timeEnd('obtieneDatosAPIAward');
                    }
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
        console.time('obtieneDatosAPIItem');
        console.log('obtieneDatosAPIItem | ' + url);
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
                    if (LOG_DEGUB_BUSCADOR) {
                        console.timeEnd('obtieneDatosAPIItem');
                    }
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
        console.time('obtieneDatosAPITenderRelItem');
        console.log('obtieneDatosAPITenderRelItem | ' + url);
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
                    if (LOG_DEGUB_BUSCADOR) {
                        console.timeEnd('obtieneDatosAPITenderRelItem');
                    }
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
Función que iniciliza los datos que dependen de la API
*/
function inicializaDatosFiltrosDatos() {
    if (LOG_DEGUB_BUSCADOR) {
        console.time('inicializaDatosFiltrosDatos');
        console.log('inicializaDatosFiltrosDatos');
    }

    obtieneDatosAPICategory(dameURL(TENDER_DISTINCT_URL_1 + TENDER_DISTINCT_URL_2 + CATEGORY));
    obtieneDatosAPIStatus(dameURL(TENDER_DISTINCT_URL_1 + TENDER_DISTINCT_URL_2 + STATUS));
    obtieneDatosAPIProcedimiento(dameURL(TENDER_DISTINCT_URL_1 + TENDER_DISTINCT_URL_2 + PROCUREMENT_METHOD_DETAILS));
    obtieneDatosAPIOrganismoCId(dameURL(PROCESS_DISTINCT_URL_1 + PROCESS_DISTINCT_URL_2 + IS_BUYER_FOR));

    if (LOG_DEGUB_BUSCADOR) {
        console.timeEnd('inicializaDatosFiltrosDatos');
    }
}

/*
Función que iniciliza los datos que dependen de la API
*/
function obtieneDatosAPICategory(url) {
    if (LOG_DEGUB_BUSCADOR) {
        console.time('obtieneDatosAPICategory');
        console.log('obtieneDatosAPICategory | ' + url);
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
                    if (LOG_DEGUB_BUSCADOR) {
                        console.timeEnd('obtieneDatosAPICategory');
                    }
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
        console.time('obtieneDatosAPIStatus');
        console.log('obtieneDatosAPIStatus | ' + url);
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
                    if (LOG_DEGUB_BUSCADOR) {
                        console.timeEnd('obtieneDatosAPIStatus');
                    }
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
        console.time('obtieneDatosAPIProcedimiento');
        console.log('obtieneDatosAPIProcedimiento | ' + url);
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
                    if (LOG_DEGUB_BUSCADOR) {
                        console.timeEnd('obtieneDatosAPIProcedimiento');
                    }
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
        console.time('obtieneDatosAPIOrganismoCId');
        console.log('obtieneDatosAPIOrganismoCId | ' + url);
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
                    if (LOG_DEGUB_BUSCADOR) {
                        console.timeEnd('obtieneDatosAPIOrganismoCId');
                    }
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
        console.time('obtieneDatosAPIOrganismoCTitle');
        console.log('obtieneDatosAPIOrganismoCTitle');
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
                            title: data.records[i].title,
                            titleClean: quitarAcentos(data.records[i].title)
                        }
                        organismoCIdTitleCol.push(orgCon);
                        organismoCMap.set(data.records[i].title, data.records[i].id);
                    }
                    if (data.next) {
                        obtieneDatosAPIOrganismoCId(dameURL(data.next));
                    } else {
                        if (LOG_DEGUB_BUSCADOR) {
                            console.timeEnd('obtieneDatosAPIOrganismoCTitle');
                        }
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

    setTimeout(function () {
        insertaDatosIniciales();
    }, 0);
}

/*
Inserta en la página web los datos obtenidos de la API
*/
function insertaDatosIniciales() {
    if (LOG_DEGUB_BUSCADOR) {
        console.time('insertaDatosIniciales');
        console.log('insertaDatosIniciales');
    }
    ETIQUETA_TIP_CONT.forEach((value, key) => {
        $("#selectCategoria").append(
            '<div class="custom-control custom-switch"><input type="checkbox" class="custom-control-input" id="categoria' +
            key +
            '" value="' +
            key +
            '">' +
            '<label class="custom-control-label" for="categoria' +
            key +
            '" data-i18n="categoria' +
            key +
            '">' +
            value +
            "</label></div>"
        );
    });

    ETIQUETA_ESTADO.forEach((value, key) => {
        $("#selectEstado").append(
            '<div class="custom-control custom-switch"><input type="checkbox" class="custom-control-input" id="estado' +
            key +
            '" value="' +
            key +
            '">' +
            '<label class="custom-control-label" for="estado' +
            key +
            '" data-i18n="estado' +
            key +
            '">' +
            value +
            "</label></div>"
        );
    });

    organismoCIdTitleCol.sort(compareTitle);
    let d;
    for (d = 0; d < organismoCIdTitleCol.length; d++) {
        /*$('#selectNomOrgContr').append(
            '<div class="checkbox"><label id="labelNomOrgCont' +
            d +
            '"><input type="checkbox" id="checkNomOrgCont' +
            d +
            '" value="' +
            organismoCIdTitleCol[d].title +
            '">' +
            organismoCIdTitleCol[d].title +
            '</label></div>'
        );*/
        $('#selectNomOrgContr').append(
            '<div class="custom-control custom-switch"><input type="checkbox" class="custom-control-input" id="checkNomOrgCont' +
            d +
            '" value="' +
            organismoCIdTitleCol[d].title +
            '">' +
            '<label class="custom-control-label" for="checkNomOrgCont' +
            d +
            '" data-i18n="estado' +
            d +
            '">' +
            organismoCIdTitleCol[d].title +
            "</label></div>"
        );
    }

    anyoCol.sort();
    let e;
    for (e = 0; e < anyoCol.length; e++) {
        $("#selectAnyo").append(
            '<div class="custom-control custom-switch"><input type="checkbox" class="custom-control-input" id="anyo' +
            anyoCol[e] +
            '" value="' +
            anyoCol[e] +
            '">' +
            '<label class="custom-control-label" for="anyo' +
            anyoCol[e] +
            '">' +
            anyoCol[e] +
            "</label></div>"
        );
    }

    ETIQUETA_TIP_PROC.forEach((value, key) => {
        $("#selectProcedimiento").append(
            '<div class="custom-control custom-switch"><input type="checkbox" class="custom-control-input" id="procedimiento' +
            key +
            '" value="' +
            key +
            '">' +
            '<label class="custom-control-label" for="procedimiento' +
            key +
            '" data-i18n="procedimiento' +
            key +
            '">' +
            value +
            "</label></div>"
        );
    });


    preparaTablaBuscadorCont(false);
    preparaTablaBuscadorAdj(false);
    capturaParam();

    cambioCapaGeneral();

    habilitaBotones();

    $(document).ready(function () {
        $('#modalCargaInicial').modal('hide');
    });

    if (LOG_DEGUB_BUSCADOR) {
        console.timeEnd('insertaDatosIniciales');
    }
}

/*
Crea una estractura que será insertada en la tabla de la página web
*/
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
        console.time('crearDatasetTabla');
        console.log(
            'creaDatasetTabla | ' +
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
    let numAwardSet = new Set();

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
        let anyoAward = '';
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
                if (fechaInicioBusqueda) {
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
                if (fechaFinBusqueda) {
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
        }/*else{
            console.log('No entra en organization buyer '+processCol[i].isBuyerFor);
        }*/
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
                    if (awardCol[lotAux[j].hasSupplier]) {
                        //Se obtiene el nombre del adjudicatario del lote
                        if (
                            organizationCol[awardCol[lotAux[j].hasSupplier].isSupplierFor]
                        ) {
                            licitador =
                                organizationCol[awardCol[lotAux[j].hasSupplier].isSupplierFor]
                                    .title;
                            if (
                                quitarAcentos(licitador)
                                    .toLowerCase()
                                    .indexOf(quitarAcentos(licitadorBusqueda).toLowerCase()) != -1
                            ) {
                                restuadolicitador = true;
                            }
                        }
                        if (awardCol[lotAux[j].hasSupplier].isSupplierFor) {
                            //Se obtiene el CIF del adjudicatario del lote
                            cifLicitador = awardCol[lotAux[j].hasSupplier].isSupplierFor;
                            if (cifLicitador.indexOf(cifLicitadorBusqueda) != -1) {
                                restuadoCifLicitador = true;
                            }
                        }

                        award = awardCol[lotAux[j].hasSupplier];
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
                    if (award) {
                        let isSupplierFor = award.isSupplierFor;
                        if (!isSupplierFor) {
                            isSupplierFor = '';
                        }
                        let group = awardGroup.get(isSupplierFor);
                        if (group) {
                            group.numAdj = group.numAdj + 1;
                            group.impAdj = group.impAdj + Number(award.valueAmount);

                            if(!numAwardSet.has(award.id))
                            {
                                //indicadores
                                numAward = numAward + 1;
                                impAward = impAward + award.valueAmount;
                                numAwardSet.add(award.id);
                            }
                            
                        } else {
                            let group = {
                                id: isSupplierFor,
                                numAdj: Number(1),
                                impAdj: Number(award.valueAmount),
                            };
                            if (organizationCol[isSupplierFor]) {
                                group.title = organizationCol[isSupplierFor].title;
                            }
                            awardGroup.set(group.id, group);

                            if(!numAwardSet.has(award.id)) {
                                //indicadores
                                numAward = numAward + 1;
                                impAward = impAward + award.valueAmount;
                                numAwardSet.add(award.id);
                            }
                            
                        }

                        let indicadorGlobal;
                        if (indicadoresTemp[award.anyo]) {
                            indicadorGlobal = indicadoresTemp[award.anyo];
                        } else {
                            indicadorGlobal = {
                                numAdj: 0,
                                impAdj: 0,
                                anyo: award.anyo,
                            };
                            anyos.push(award.anyo);
                        }
                        indicadorGlobal.numAdj = indicadorGlobal.numAdj + 1;
                        indicadorGlobal.impAdj = indicadorGlobal.impAdj + award.valueAmount;
                        indicadoresTemp[award.anyo] = indicadorGlobal;

                        if (isSupplierFor) {
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
                        }

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

                            //indicadores
                            if (procedimiento == INDICADOR_1_TIPO_PROCEDIMIENTO) {
                                numProc1 = numProc1 + 1;
                            }
                            if (procedimiento == INDICADOR_2_TIPO_PROCEDIMIENTO) {
                                numProc2 = numProc2 + 1;
                            }
                            numProcTotal = numProcTotal + 1;

                            // tipo de contratos
                            let numC = tipoContNum.get(categoria);
                            if (numC) {
                                tipoContNum.set(categoria, numC + 1);
                            } else {
                                tipoContNum.set(categoria, 1);
                            }
                            let impC = tipoContImp.get(categoria);
                            if (impC) {
                                tipoContImp.set(categoria, Number(impC) + Number(importePliego));
                            } else {
                                tipoContImp.set(categoria, Number(importePliego));
                            }

                            let numP = tipoProcNum.get(procedimiento);
                            if (numP) {
                                tipoProcNum.set(procedimiento, numP + 1);
                            } else {
                                tipoProcNum.set(procedimiento, 1);
                            }
                            let impP = tipoProcImp.get(procedimiento);
                            if (impP) {
                                tipoProcImp.set(procedimiento, Number(impP) + Number(importePliego));
                            } else {
                                tipoProcImp.set(procedimiento, Number(importePliego));
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
                            if (organismoCTitle && importePliego) {
                                let imp = orgContratanteImp.get(organismoCTitle);
                                if (imp) {
                                    imp = imp + importePliego;
                                } else {
                                    imp = Number(importePliego);
                                }
                                orgContratanteImp.set(organismoCTitle, imp);
                            }
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

        if (!lotEncontrado) {
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
                if (award) {
                    let isSupplierFor = award.isSupplierFor;
                    if (!isSupplierFor) {
                        isSupplierFor = '';
                    }
                    let group = awardGroup.get(isSupplierFor);
                    if (group) {
                        group.numAdj = group.numAdj + 1;
                        group.impAdj = group.impAdj + Number(award.valueAmount);
                        
                        if(!numAwardSet.has(award.id)) {
                            //indicadores
                            numAward = numAward + 1;
                            impAward = impAward + award.valueAmount;
                            numAwardSet.add(award.id);
                        }
                        
                    } else {
                        group = {
                            id: isSupplierFor,
                            numAdj: Number(1),
                            impAdj: Number(award.valueAmount),
                        };
                        if (organizationCol[isSupplierFor]) {
                            group.title = organizationCol[isSupplierFor].title;
                        }
                        if(!numAwardSet.has(award.id)) {
                            //indicadores
                            numAward = numAward + 1;
                            impAward = impAward + award.valueAmount;
                            numAwardSet.add(award.id);
                        }
                        
                    }
                    awardGroup.set(group.id, group);

                    let indicadorGlobal;
                    if (indicadoresTemp[award.anyo]) {
                        indicadorGlobal = indicadoresTemp[award.anyo];
                    } else {
                        indicadorGlobal = {
                            numAdj: 0,
                            impAdj: 0,
                            anyo: award.anyo,
                        };
                        anyos.push(award.anyo);
                    }
                    indicadorGlobal.numAdj = indicadorGlobal.numAdj + 1;
                    indicadorGlobal.impAdj = indicadorGlobal.impAdj + award.valueAmount;
                    indicadoresTemp[award.anyo] = indicadorGlobal;

                    if (isSupplierFor) {
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
                    }

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
                }

                if (tenderEncontrado) {
                    //indicadores
                    numTender = numTender + 1;
                    impTender = Number(impTender) + Number(importePliego);

                    //indicadores
                    if (procedimiento == INDICADOR_1_TIPO_PROCEDIMIENTO) {
                        numProc1 = numProc1 + 1;
                    }
                    if (procedimiento == INDICADOR_2_TIPO_PROCEDIMIENTO) {
                        numProc2 = numProc2 + 1;
                    }
                    numProcTotal = numProcTotal + 1;

                    // tipo de contratos
                    let numC = tipoContNum.get(categoria);
                    if (numC) {
                        tipoContNum.set(categoria, numC + 1);
                    } else {
                        tipoContNum.set(categoria, 1);
                    }
                    let impC = tipoContImp.get(categoria);
                    if (impC) {
                        tipoContImp.set(categoria, Number(impC) + Number(importePliego));
                    } else {
                        tipoContImp.set(categoria, Number(importePliego));
                    }

                    let numP = tipoProcNum.get(procedimiento);
                    if (numP) {
                        tipoProcNum.set(procedimiento, numP + 1);
                    } else {
                        tipoProcNum.set(procedimiento, 1);
                    }
                    let impP = tipoProcImp.get(procedimiento);
                    if (impP) {
                        tipoProcImp.set(procedimiento, Number(impP) + Number(importePliego));
                    } else {
                        tipoProcImp.set(procedimiento, Number(importePliego));
                    }

                    // Grafico imp org contratante
                    if (organismoCTitle && importePliego) {
                        let imp = orgContratanteImp.get(organismoCTitle);
                        if (imp) {
                            imp = imp + importePliego;
                        } else {
                            imp = Number(importePliego);
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

    // tabla contratos
    let tableCont = $('#tablaContratos').DataTable();
    tableCont.clear().draw();
    tableCont.rows.add(dataSet).draw();

    // tabla adjudicatarios
    awardGroup.forEach(contruyeDatasetAdj);
    let tableAdj = $('#tablaAdjudicatarios').DataTable();
    tableAdj.clear().draw();
    tableAdj.rows.add(datasetAdj).draw();

    //indicadores
    let nLicitaciones = numeral(numTender);
    $('#numLicitaciones').html(nLicitaciones.format());
    $('#numLicitacionesGI').html(nLicitaciones.format());

    let sImporteLicitaciones = numeral(impTender);
    $('#importeLicitaciones').html(
        sImporteLicitaciones.format(importeFormato, Math.ceil)
    );
    $('#importeLicitacionesGI').html(
        sImporteLicitaciones.format(importeFormato, Math.ceil)
    );

    let simporteMedLicitaciones = numeral(impTender / numTender);
    $('#importeMedLicitaciones').html(
        simporteMedLicitaciones.format(importeFormato, Math.ceil)
    );
    $('#importeMedLicitacionesGI').html(
        simporteMedLicitaciones.format(importeFormato, Math.ceil)
    );

    let nAdjudicatarios = numeral(numAward);
    $('#numAdjudicatarios').html(nAdjudicatarios.format());
    $('#numAdjudicatariosGI').html(nAdjudicatarios.format());

    let sImporteAdjudicatarios = numeral(impAward);
    $('#importeAdjudicatarios').html(
        sImporteAdjudicatarios.format(importeFormato, Math.ceil)
    );
    $('#importeAdjudicatariosGI').html(
        sImporteAdjudicatarios.format(importeFormato, Math.ceil)
    );

    let simpMedAdjudicatarios = numeral(impAward / numAward);
    $('#importeMedAdjudicatarios').html(
        simpMedAdjudicatarios.format(importeFormato, Math.ceil)
    );
    $('#importeMedAdjudicatariosGI').html(
        simpMedAdjudicatarios.format(importeFormato, Math.ceil)
    );

    let pnumProc1 = numeral((numProc1 * 100) / numProcTotal);
    $('#porcentajeProcemimento1').html(pnumProc1.format(numFormato, Math.ceil));
    $('#porcentajeProcemimento1GI').html(pnumProc1.format(numFormato, Math.ceil));
    $('#indTipoProcedimiento1').html(
        ETIQUETA_TIP_PROC.get(INDICADOR_1_TIPO_PROCEDIMIENTO)
    );
    $('#indTipoProcedimiento1GI').html(
        ETIQUETA_TIP_PROC.get(INDICADOR_1_TIPO_PROCEDIMIENTO)
    );

    let pnumProc2 = numeral((numProc2 * 100) / numProcTotal);
    $('#porcentajeProcemimento2').html(pnumProc2.format(numFormato, Math.ceil));
    $('#porcentajeProcemimento2GI').html(pnumProc2.format(numFormato, Math.ceil));
    $('#indTipoProcedimiento2').html(
        ETIQUETA_TIP_PROC.get(INDICADOR_2_TIPO_PROCEDIMIENTO)
    );
    $('#indTipoProcedimiento2GI').html(
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
    $('#porcentajeDiezContratosMayorGI').html(
        sdiezImpAwardMayor.format(numFormato, Math.ceil)
    );

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
    let z;
    for (z = 0; z < anyos.length; z++) {
        let anyo = anyos[z];
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
    $('#datosIndAnualesGI').html(htmlContentIndAnuales);
    pintaGraficoIndicadoresGlobales(indicadoresGlobales, 'chartdiv');
    pintaGraficoIndicadoresGlobales(indicadoresGlobales, 'chartdiv2');
    pintaGraficoIndicadoresGlobales(indicadoresGlobales, 'chartdivGI');
    pintaGraficoIndicadoresGlobales(indicadoresGlobales, 'chartdiv2GI');



    orgContratanteImp.forEach(contruyeOrgContImp);
    orgContratanteColIzq.sort(compareImp);
    if (orgContratanteColIzq.length > 0) {
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
    $('#datos_tablaTipAdjGI').html(htmlContentTipAdj);

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
    let importeCadena5 = $.i18n('importe');

    let htmlContentTipoContImp =
        '<div class="row"><div class="col-md-12"><table style="width: 100%;"><tr><th>' +
        tipoContratoCadena +
        '</th><th>' +
        importeCadena5 +
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

    if (LOG_DEGUB_BUSCADOR) {
        console.timeEnd('crearDatasetTabla');
    }
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
Función que inicializa la tabla de búsqueda
*/
function preparaTablaBuscadorCont(segundaPasada) {
    if (LOG_DEGUB_BUSCADOR) {
        console.log('INFO preparaTablaBuscadorCont');
    }

    let dataSet = [];
    let expedienteCadena = $.i18n('n_expediente');
    let nombreCadena = $.i18n('nombre');
    let categoriaCadena = $.i18n('categoria');
    let estadoCadena = $.i18n('estado');
    let organismoContratanteCadena = $.i18n('organismo_contratante');
    let numeroLicitadoresCadena = $.i18n('numero_licitadores');
    let adjudicatarioCadena = $.i18n('adjudicatario');
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
        responsive: true,
        colReorder: true,
        searching: true,
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
        order: [[2, 'adescsc']],
        columnDefs: [{ 'targets': 2, 'type': 'date-eu' }],
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
                    return row[2];
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
                    return row[14];
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
                    return row[12];
                },

            },
            {
                title: numeroLicitadoresCadena,
                render: function (data, type, row) {
                    return row[8];
                },
            }
        ],
        dom: '<"row panel-footer"<"col-sm-2"l><"col-sm2"f><"col-sm-4"B>>rt<"row"<"col-sm-6"i><"col-sm-6"p>>',
        buttons: [
            {
                extend: 'colvis',
                text: '<i class="fa fa-columns">&nbsp;</i>' + modificarTablaCadena,
                title: 'modificar tabla',
                className: 'btn btn-light'
            },
            {
                extend: 'collection',
                text: '<i class="fa fa-download">&nbsp;</i>' + descargarCadena,
                title: 'descargar',
                className: 'btn btn-light',
                buttons: [
                    {
                        extend: 'csv',
                        text: '<span class="fa-fw fa fa-table"></span> CSV ',
                        title: 'contratos',
                        className: '',
                        exportOptions: {
                            search: 'applied',
                            order: 'applied',
                        },
                        bom: true,
                    },
                    {
                        extend: 'excel',
                        text: '<span class="fa-fw fa fa-file-excel-o"></span> EXCEL ',
                        title: '',
                        className: '',
                        exportOptions: {
                            search: 'applied',
                            order: 'applied',
                        },
                    },
                    {
                        text: '<span class="fa-fw fa fa-list-alt "></span> JSON ',
                        title: 'contratos',
                        className: '',
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
                        text: '<span class="fa-fw fa fa-file-pdf-o"></span> PDF ',
                        title: 'contratos',
                        className: '',
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
                className: 'btn btn-light dropdown-menu-right button-right',
                buttons: [
                    {
                        extend: 'copy',
                        text: ' <span class="fa fa-files-o"></span>' + copyCadena,
                        title: 'contratos',
                        className: '',
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
        $('#tablaContratos tbody').off('click', 'td.details-control');
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
        responsive: true,
        colReorder: true,
        searching: true,
        autoWidth: false,
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
        order: [[2, 'desc']],
        columnDefs: [
            { width: '40%', targets: 0 },
            { width: '20%', targets: 1 },
            { width: '20%', targets: 2 },
            { width: '20%', targets: 3 },
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
                    return row[3];
                },
            },
        ],
        dom: '<"row panel-footer"<"col-sm-3"l><"col-sm-4"f><"col-sm-5"B>>rt<"row"<"col-sm-6"i><"col-sm-6"p>>',
        buttons: [
            {
                extend: 'colvis',
                text: '<i class="fa fa-columns">&nbsp;</i>' + modificarTablaCadena,
                title: 'modificar tabla',
                className: 'btn btn-light'
            },
            {
                extend: 'collection',
                text: '<i class="fa fa-download">&nbsp;</i>' + descargarCadena,
                title: 'descargar',
                className: 'btn btn-light',
                buttons: [
                    {
                        extend: 'csv',
                        text: '<span class="fa-fw fa fa-table"></span> CSV ',
                        title: 'adjudicatarios',
                        className: '',
                        exportOptions: {
                            search: 'applied',
                            order: 'applied',
                        },
                        bom: true,
                    },
                    {
                        extend: 'excel',
                        text: '<span class="fa-fw fa fa-file-excel-o"></span> EXCEL ',
                        title: '',
                        className: '',
                        exportOptions: {
                            search: 'applied',
                            order: 'applied',
                        },
                    },
                    {
                        text: '<span class="fa-fw fa fa-list-alt "></span> JSON ',
                        title: 'adjudicatarios',
                        className: '',
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
                        text: '<span class="fa-fw fa fa-file-pdf-o "></span> PDF ',
                        title: 'adjudicatarios',
                        className: '',
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
                className: 'btn btn-light dropdown-menu-right button-right',
                buttons: [
                    {
                        extend: 'copy',
                        text: ' <span class="fa fa-files-o"></span>' + copyCadena,
                        title: 'adjudicatarios',
                        className: '',
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
        $('#tablaAdjudicatarios tbody').off('click', 'td.details-control');
        $('#tablaAdjudicatarios tbody').on(
            'click',
            'td.details-control',
            function () {
                let td = $(this).closest('td').html();
                let tr = $(this).closest('tr');
                let row = tablaAdjudicatarios.row(tr);

                let url;
                if (td.includes('fichaAdjudicatario') && row.data()[1]) {
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
    if (LOG_DEGUB_BUSCADOR) {
        console.log('INFO dameCeldaAdjudicatario');
    }
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
Funcion que realiza las busquedas en la tabla
*/
function buscar() {
    if (LOG_DEGUB_BUSCADOR) {
        console.time('buscar');
        console.log('buscar');
    }

    $('#textoBusquedaGraficosCont').html('');
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

    let textoBusqueda = '';
    let textoBusquedaTabla = '';
    let busquedaTodo = true;

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

    if (idBusqueda) {
        textoBusqueda =
            textoBusqueda +
            '<span class="textoNegrita">' +
            $.i18n('n_expediente:') +
            '</span>' +
            ' ' +
            idBusqueda;
        busquedaTodo = false;
    }

    if (nombreBusqueda) {
        textoBusqueda =
            textoBusqueda +
            '<span class="textoNegrita">' +
            $.i18n('nombre:') +
            '</span>' +
            ' ' +
            nombreBusqueda + ' | ';
        busquedaTodo = false;
    }
    let l;
    for (l = 0; l < anyoSelec.length; l++) {
        if (!l) {
            textoBusqueda =
                textoBusqueda +
                '<span class="textoNegrita">' +
                $.i18n('anyo:') +
                '</span>' +
                ' ';
        }
        let anyoBusqueda = anyoSelec[l];
        if (anyoBusqueda) {
            textoBusqueda =
                textoBusqueda +
                anyoBusqueda + " | ";
            busquedaTodo = false;
        }
    }
    let q;
    for (q = 0; q < categoriaSelec.length; q++) {

        if (!q) {
            textoBusqueda = textoBusqueda +
                '<span class="textoNegrita">' +
                $.i18n('categoria:') +
                '</span>' +
                ' ';
        }

        let categoriaBusqueda = categoriaSelec[q];
        if (categoriaBusqueda) {
            textoBusqueda =
                textoBusqueda +
                ETIQUETA_TIP_CONT.get(categoriaBusqueda) + " | ";
            busquedaTodo = false;
        }
    }
    let r;
    for (r = 0; r < estadosSelec.length; r++) {
        let estado = estadosSelec[r];

        if (!r) {
            textoBusqueda =
                textoBusqueda +
                '<span class="textoNegrita">' +
                $.i18n('estado:') +
                '</span>' +
                ' ';
        }

        if (estado) {
            textoBusqueda =
                textoBusqueda +
                ETIQUETA_ESTADO.get(estado) + " | ";
            busquedaTodo = false;
        }
    }

    let o;
    for (o = 0; o < orgContrSelec.length; o++) {
        let titleOrgContrBusqueda = orgContrSelec[o];

        if (!o) {
            textoBusqueda =
                textoBusqueda +
                '<span class="textoNegrita">' +
                $.i18n('organizacion_contratante:') +
                '</span>' +
                ' ';
        }

        if (titleOrgContrBusqueda) {
            textoBusqueda =
                textoBusqueda +
                titleOrgContrBusqueda + ' | ';
            busquedaTodo = false;
        }
        idOrgContrBusqueda = organismoCMap.get(titleOrgContrBusqueda);
    }

    if (fechaInicioBusqueda || fechaFinBusqueda) {
        textoBusqueda =
            textoBusqueda +
            '<span class="textoNegrita">' + $.i18n('fecha') +
            '</span>' +
            ' ';

    }

    if (fechaInicioBusqueda) {
        if (textoBusqueda) {
            textoBusqueda = textoBusqueda + ' | ';
        }
        textoBusqueda =
            textoBusqueda +
            '<span class="textoNegrita">' +
            $.i18n('desde:') +
            '</span>' +
            ' ' +
            fechaInicioBusqueda;
        busquedaTodo = false;
    }

    if (fechaFinBusqueda) {
        if (textoBusqueda) {
            textoBusqueda = textoBusqueda + ' | ';
        }
        textoBusqueda =
            textoBusqueda +
            '<span class="textoNegrita">' +
            $.i18n('hasta:') +
            '</span>' +
            ' ' +
            fechaFinBusqueda;
        busquedaTodo = false;
    }
    let s;
    for (s = 0; s < procedimientoSelec.length; s++) {
        let procedimientoBusqueda = procedimientoSelec[s];

        if (!s) {
            textoBusqueda =
                textoBusqueda +
                '<span class="textoNegrita">' +
                $.i18n('procedimiento:') +
                '</span>' +
                ' ';
        }

        if (procedimientoBusqueda) {
            textoBusqueda =
                textoBusqueda +
                ETIQUETA_TIP_PROC.get(procedimientoBusqueda) + ' | ';
            busquedaTodo = false;
        }
    }

    if (licitadorBusqueda) {
        if (textoBusqueda) {
            textoBusqueda = textoBusqueda + ' | ';
        }
        textoBusqueda =
            textoBusqueda +
            '<span class="textoNegrita">' +
            $.i18n('adjudicatario:') +
            '</span>' +
            ' ' +
            licitadorBusqueda;
        busquedaTodo = false;
    }

    if (CPVBusqueda) {
        if (textoBusqueda) {
            textoBusqueda = textoBusqueda + ' | ';
        }
        textoBusqueda =
            textoBusqueda +
            '<span class="textoNegrita">' +
            $.i18n('CPV:') +
            '</span>' +
            ' ' +
            CPVBusqueda;
        busquedaTodo = false;
    }

    if (importeDesdeBusqueda) {
        if (textoBusqueda) {
            textoBusqueda = textoBusqueda + ' | ';
        }
        textoBusqueda =
            textoBusqueda +
            '<span class="textoNegrita">' +
            $.i18n('importe') +
            ' ' +
            $.i18n('desde:') +
            '</span>' +
            ' ' +
            importeDesdeBusqueda;
        busquedaTodo = false;
    }

    if (importeHastaBusqueda) {
        if (textoBusqueda) {
            textoBusqueda = textoBusqueda + ' | ';
        }
        textoBusqueda =
            textoBusqueda +
            '<span class="textoNegrita">' +
            $.i18n('importe') +
            ' ' +
            $.i18n('hasta:') +
            '</span>' +
            ' ' +
            importeHastaBusqueda;
        busquedaTodo = false;
    }

    if (cifLicitadorBusqueda) {
        if (textoBusqueda) {
            textoBusqueda = textoBusqueda + ' | ';
        }
        textoBusqueda =
            textoBusqueda +
            '<span class="textoNegrita">' +
            $.i18n('adjudicatario_cif:') +
            '</span>' +
            ' ' +
            cifLicitadorBusqueda;
        busquedaTodo = false;
    }

    if (busquedaTodo) {
        textoBusquedaTabla = $.i18n('datos_tabla_filtrar');
        textoBusquedaGrafico = $.i18n('datos_grafico_filtrar');
    }
    $('#textoBusquedaTabla').html(textoBusquedaTabla + textoBusqueda);
    $('#textoBusquedaGraficosCont').html(textoBusquedaTabla + textoBusqueda);

    if (LOG_DEGUB_BUSCADOR) {
        console.time('llamadacreadataset');
    }
    am4core.disposeAllCharts();

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
    if (LOG_DEGUB_BUSCADOR) {
        console.timeEnd('llamadacreadataset');
    }

    orgContratanteNum.forEach(contruyeOrgContNum);
    datosGraficoOrgContImp();
    datosGraficoOrgContNum();

    awardImp.forEach(contruyeAwardImp);
    awardNum.forEach(contruyeAwardNum);
    datosGraficoAwardImp();
    datosGraficoAwardNum();

    $('#modalCargaInicial').on('shown.bs.modal', function (e) {
        $('#modalCargaInicial').modal('hide');
    });

    if (LOG_DEGUB_BUSCADOR) {
        console.timeEnd('buscar');
    }
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
    $('#' + capa + ' input').prop('checked', true);
}

function quitarSeleccion(capa) {
    if (LOG_DEGUB_BUSCADOR) {
        console.log('INFO quitarSeleccion');
    }
    $('#' + capa + ' input').prop('checked', false);
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
    $('#capaGraficosInd').hide();



    $('#liGeneral').css('border-bottom', '2px solid #006aa0');
    $('#buttonGeneral').css('font-weight', 'bold');
    $('#liLicitaciones').css('border-bottom', '2px solid #eaeaea');
    $('#buttonLicitaciones').css('font-weight', 'normal');
    $('#liAdjudicatarios').css('border-bottom', '2px solid #eaeaea');
    $('#buttonAdjudicatarios').css('font-weight', 'normal');
    $('#liGraficosInd').css('border-bottom', '2px solid #eaeaea');
    $('#buttonGraficosInd').css('font-weight', 'normal');

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
    $('#capaGraficosInd').hide();


    $('#liGeneral').css('border-bottom', '2px solid #eaeaea');
    $('#buttonGeneral').css('font-weight', 'normal');
    $('#liLicitaciones').css('border-bottom', '2px solid #006aa0');
    $('#buttonLicitaciones').css('font-weight', 'bold');
    $('#liAdjudicatarios').css('border-bottom', '2px solid #eaeaea');
    $('#buttonAdjudicatarios').css('font-weight', 'normal');
    $('#liGraficosInd').css('border-bottom', '2px solid #eaeaea');
    $('#buttonGraficosInd').css('font-weight', 'normal');

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
    $('#capaGraficosInd').hide();


    $('#liGeneral').css('border-bottom', '2px solid #eaeaea');
    $('#buttonGeneral').css('font-weight', 'normal');
    $('#liLicitaciones').css('border-bottom', '2px solid #eaeaea');
    $('#buttonLicitaciones').css('font-weight', 'normal');
    $('#liAdjudicatarios').css('border-bottom', '2px solid #006aa0');
    $('#buttonAdjudicatarios').css('font-weight', 'bold');
    $('#liGraficosInd').css('border-bottom', '2px solid #eaeaea');
    $('#buttonGraficosInd').css('font-weight', 'normal');

    $('#iframeBuscador', window.parent.document).height(1563);
    heightInicial = 1563;
}

/*
cambioCapaGraficosInd
*/
function cambioCapaGraficosInd() {
    if (LOG_DEGUB_BUSCADOR) {
        console.log('INFO cambioCapaAdjudicatarios');
    }

    $('#capaGeneral').hide();
    $('#capaLicitaciones').hide();
    $('#capaAdjudicatarios').hide();
    $('#capaGraficosInd').show();

    pintaGraficoTipAdjGI(tipAdjCol, 'chartTipAdjGI');
    pintaGraficoTipAdjGI(tipAdjCol, 'chartTipAdj2GI');

    $('#liGeneral').css('border-bottom', '2px solid #eaeaea');
    $('#buttonGeneral').css('font-weight', 'normal');
    $('#liLicitaciones').css('border-bottom', '2px solid #eaeaea');
    $('#buttonLicitaciones').css('font-weight', 'normal');
    $('#liAdjudicatarios').css('border-bottom', '2px solid #eaeaea');
    $('#buttonAdjudicatarios').css('font-weight', 'normal');
    $('#liGraficosInd').css('border-bottom', '2px solid #006aa0');
    $('#buttonGraficosInd').css('font-weight', 'bold');

    $('#iframeBuscador', window.parent.document).height(1563);
    heightInicial = 1563;
}

/*
habilitaBotones
*/
function habilitaBotones() {
    if (LOG_DEGUB_BUSCADOR) {
        console.log('INFO habilitaBotones');
    }
    $('#buscarListado').removeAttr('disabled');
    $('#buttonLicitaciones').removeAttr('disabled');
    $('#buttonAdjudicatarios').removeAttr('disabled');
    $('#buttonGraficosInd').removeAttr('disabled');
    $('#buscarListado').removeClass('disabled');
    $('#buttonLicitaciones').removeClass('disabled');
    $('#buttonAdjudicatarios').removeClass('disabled');
    $('#buttonGraficosInd').removeClass('disabled');
}

/*
quitarAcentos
*/
function quitarAcentos(cadena) {
    if (LOG_DEGUB_BUSCADOR) {
        console.log('INFO quitarAcentos');
    }
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

/*
quitaSeleccionAnyos
*/
function quitaSeleccionAnyos() {
    if (LOG_DEGUB_BUSCADOR) {
        console.log('INFO quitaSeleccionAnyos');
    }
    let e;
    for (e = 0; e < anyoCol.length; e++) {
        $('#anyo' + anyoCol[e]).prop('checked', false);
    }
}

/*
quitaSeleccionAnyos
*/
function obteneValoresAnyos() {
    if (LOG_DEGUB_BUSCADOR) {
        console.log('INFO obteneValoresAnyos');
    }
    let e;
    for (e = 0; e < anyoCol.length; e++) {
        if ($('#anyo' + anyoCol[e]).prop('checked')) {
            let anyoAux = $('#anyo' + anyoCol[e]).val();
            anyoSelec.push(anyoAux);
        }
    }
}

/*
quitaSeleccionEstados
*/
function quitaSeleccionEstados() {
    if (LOG_DEGUB_BUSCADOR) {
        console.log('INFO quitaSeleccionEstados');
    }
    ETIQUETA_ESTADO.forEach((value, key) => {
        $('#estado' + key).prop('checked', false);
    });
}

/*
obteneValoresEstados
*/
function obteneValoresEstados() {
    if (LOG_DEGUB_BUSCADOR) {
        console.log('INFO obteneValoresEstados');
    }
    ETIQUETA_ESTADO.forEach((value, key) => {
        if ($('#estado' + key).prop('checked')) {
            let estadoAux = $('#estado' + key).val();
            estadosSelec.push(estadoAux);
        }
    });
}

/*
quitaSeleccionCategorias
*/
function quitaSeleccionCategorias() {
    if (LOG_DEGUB_BUSCADOR) {
        console.log('INFO quitaSeleccionCategorias');
    }
    ETIQUETA_TIP_CONT.forEach((value, key) => {
        $('#categoria' + key).prop('checked', false);
    });
}

/*
obteneValoresCategorias
*/
function obteneValoresCategorias() {
    if (LOG_DEGUB_BUSCADOR) {
        console.log('INFO obteneValoresCategorias');
    }
    ETIQUETA_TIP_CONT.forEach((value, key) => {
        if ($('#categoria' + key).prop('checked')) {
            let categoriaAux = $('#categoria' + key).val();
            categoriaSelec.push(categoriaAux);
        }
    });
}

/*
quitaSeleccionProcedimiento
*/
function quitaSeleccionProcedimiento() {
    if (LOG_DEGUB_BUSCADOR) {
        console.log('INFO quitaSeleccionProcedimiento');
    }
    ETIQUETA_TIP_PROC.forEach((value, key) => {
        $('#procedimiento' + key).prop('checked', false);
    });
}

/*
obteneValoresProcedimiento
*/
function obteneValoresProcedimiento() {
    if (LOG_DEGUB_BUSCADOR) {
        console.log('INFO obteneValoresProcedimiento');
    }
    ETIQUETA_TIP_PROC.forEach((value, key) => {
        if ($('#procedimiento' + key).prop('checked')) {
            let procedimientoAux = $('#procedimiento' + key).val();
            procedimientoSelec.push(procedimientoAux);
        }
    });
}

/*
quitaSeleccionOrgContr
*/
function quitaSeleccionOrgContr() {
    if (LOG_DEGUB_BUSCADOR) {
        console.log('INFO quitaSeleccionOrgContr');
    }
    let d;
    for (d = 0; d < organismoCIdTitleCol.length; d++) {
        $('#checkNomOrgCont' + d).prop('checked', false);
    }
}

/*
obteneValoresOrgContr
*/
function obteneValoresOrgContr() {
    if (LOG_DEGUB_BUSCADOR) {
        console.log('INFO obteneValoresOrgContr');
    }
    let d;
    for (d = 0; d < organismoCIdTitleCol.length; d++) {
        if ($('#checkNomOrgCont' + d).prop('checked')) {
            let orgContrAux = $('#checkNomOrgCont' + d).val();
            orgContrSelec.push(orgContrAux);
        }
    }
}

/*
searchOrganizacion
*/
function searchOrganizacion() {
    if (LOG_DEGUB_BUSCADOR) {
        console.log('INFO searchOrganizacion');
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

/*
Función que pinta el gráfico Indicadores anuales
*/
function pintaGraficoIndicadoresGlobales(indicadoresGlobales, div) {
    if (LOG_DEGUB_BUSCADOR) {
        console.log('INFO pintaGraficoIndicadoresGlobales');
    }

    let anyoCadena2 = $.i18n('anyos2');
    let noAdjudicatarioCadena2 = $.i18n('num_adjudicatario2');
    let importeCadena2 = $.i18n('importe_adjudicatario2');

    let chart = am4core.create(div, am4charts.XYChart);

    chart.colors.list = [
        am4core.color('#845EC2'),
        am4core.color('#0077b6'),
    ];

    chart.data = indicadoresGlobales;
    chart.language.locale._decimalSeparator = ',';
    chart.language.locale._thousandSeparator = '.';

    chart.focusFilter.stroke = am4core.color('#0f0');
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
    series2.stroke = am4core.color('#845EC2');
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
    series3.stroke = am4core.color('#0077b6');
    series3.strokeWidth = 3;
    series3.bullets.push(new am4charts.CircleBullet());
    series3.tooltipText = '{name} en {categoryX}: {valueY}';
    series3.legendSettings.valueText = '{valueY}';

    chart.cursor = new am4charts.XYCursor();
    chart.cursor.behavior = 'zoomY';

    chart.legend = new am4charts.Legend();

    if (div == 'chartdiv') {
        chart.exporting.menu = new am4core.ExportMenu();
        chart.exporting.menu.container = document.getElementById('exportIndAnuales');
        chart.exporting.filePrefix = 'grafico';
        chart.exporting.menu.items = [{
            label: "<i class='fa fa-download fa-2'></i>",
            menu: [
                { type: 'csv', label: 'CSV' },
                { type: 'xlsx', label: 'XLSX' },
                { type: 'json', label: 'JSON' },
            ],
        }];
    } else if (div == 'chartdivGI') {
        chart.exporting.menu = new am4core.ExportMenu();
        chart.exporting.menu.container = document.getElementById("exportIndAnualesGI");
        chart.exporting.filePrefix = 'grafico';
        chart.exporting.menu.items = [{
            label: "<i class='fa fa-download fa-2'></i>",
            menu: [
                { type: 'csv', label: 'CSV' },
                { type: 'xlsx', label: 'XLSX' },
                { type: 'json', label: 'JSON' },
            ],
        }];
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

/*
Función que muestra u oculta la capa de la tabla de datos
*/
function mostrarDatosIndAnualesGI() {
    if (LOG_DEGUB_BUSCADOR) {
        console.log('INFO mostrarDatosIndAnualesGI');
    }

    $('#datosIndAnualesGI').toggle();
    if (!heightInicial) {
        heightInicial = $('#iframeBuscador', window.parent.document).height();
    }

    let isVisible = $('#datosIndAnualesGI').is(':visible');
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
    for (d = 0; d < orgContratanteColIzq.length; d++) {
        if (orgContratanteColIzq[d].nameCorto.substring(0, 28) == nameCorto.substring(0, 28)) {
            numIguales = numIguales + 1;
        }
    }
    if (numIguales != 0) {
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
    am4core.useTheme(am4themes_animated);

    let chart = am4core.create(div, am4charts.XYChart);
    chart.data = data;
    chart.language.locale = am4lang_es_ES;

    chart.hiddenState.properties.opacity = 0;

    let categoryAxis = chart.yAxes.push(new am4charts.CategoryAxis());
    categoryAxis.dataFields.category = 'nameCompl';
    categoryAxis.renderer.grid.template.location = 0;
    categoryAxis.renderer.minGridDistance = 1;
    categoryAxis.renderer.inversed = true;
    categoryAxis.renderer.grid.template.disabled = true;

    let valueAxis = chart.xAxes.push(new am4charts.ValueAxis());
    valueAxis.min = 0;

    let series = chart.series.push(new am4charts.ColumnSeries());
    series.dataFields.categoryY = 'nameCompl';
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

    if (div == 'chartOrgContImp') {
        chart.exporting.menu = new am4core.ExportMenu();
        chart.exporting.menu.container = document.getElementById("exportOrgContImp");
        chart.exporting.filePrefix = 'grafico';
        chart.exporting.menu.items = [{
            label: "<i class='fa fa-download fa-2'></i>",
            menu: [
                { type: 'csv', label: 'CSV' },
                { type: 'xlsx', label: 'XLSX' },
                { type: 'json', label: 'JSON' },
            ],
        }];
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

/*
contruyeOrgContNum
*/
function contruyeOrgContNum(value, key) {
    if (LOG_DEGUB_BUSCADOR) {
        console.log('INFO contruyeOrgContNum');
    }
    let nameCompl = key;
    let nameCorto = nameCompl.substring(0, 30);
    let numIguales = 0;
    let d;
    for (d = 0; d < orgContratanteColDer.length; d++) {
        if (orgContratanteColDer[d].nameCorto.substring(0, 28) == nameCorto.substring(0, 28)) {
            numIguales = numIguales + 1;
        }
    }
    if (numIguales != 0) {
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
    let numeroContratos = $.i18n('numero_contratos');

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
    am4core.useTheme(am4themes_animated);

    let chart = am4core.create(div, am4charts.XYChart);
    chart.data = data;
    chart.language.locale = am4lang_es_ES;

    chart.hiddenState.properties.opacity = 0;

    let categoryAxis = chart.yAxes.push(new am4charts.CategoryAxis());
    categoryAxis.dataFields.category = 'nameCompl';
    categoryAxis.renderer.grid.template.location = 0;
    categoryAxis.renderer.minGridDistance = 1;
    categoryAxis.renderer.inversed = true;
    categoryAxis.renderer.grid.template.disabled = true;

    let valueAxis = chart.xAxes.push(new am4charts.ValueAxis());
    valueAxis.min = 0;

    let series = chart.series.push(new am4charts.ColumnSeries());
    series.dataFields.categoryY = 'nameCompl';
    series.dataFields.valueX = 'numTotal';
    series.columns.template.properties.tooltipText = '{numTotal}';
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

    if (div == 'chartOrgContNum') {
        chart.exporting.menu = new am4core.ExportMenu();
        chart.exporting.menu.container = document.getElementById("exportOrgContNum");
        chart.exporting.filePrefix = 'grafico';
        chart.exporting.menu.items = [{
            label: "<i class='fa fa-download fa-2'></i>",
            menu: [
                { type: 'csv', label: 'CSV' },
                { type: 'xlsx', label: 'XLSX' },
                { type: 'json', label: 'JSON' },
            ],
        }];
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

/*
contruyeDatasetAdj
*/
function contruyeDatasetAdj(value, key) {
    if (LOG_DEGUB_BUSCADOR) {
        console.log('INFO contruyeDatasetAdj');
    }
    if(value.title) {
        datasetAdj[posResultAdj] = [
            value.title,
            value.id,
            value.numAdj,
            Math.round((value.impAdj + Number.EPSILON) * 100) / 100,
        ];
        posResultAdj = posResultAdj + 1;
    }
   
    awardNum.set(value.id, value.numAdj);
    awardImp.set(value.id, value.impAdj);
}

/*
contruyeAwardImp
*/
function contruyeAwardImp(value, key) {
    if (LOG_DEGUB_BUSCADOR) {
        console.log('INFO contruyeAwardImp');
    }
    let id = key;
    let nameCompl = '';
    let nameCorto = '';
    if (id) {
        nameCompl = organizationCol[key].title;
        nameCorto = nameCompl.substring(0, 30);
    }
    let numIguales = 0;
    let d;
    for (d = 0; d < awardColIzq.length; d++) {
        if (awardColIzq[d].nameCorto.substring(0, 28) == nameCorto.substring(0, 28)) {
            numIguales = numIguales + 1;
        }
    }
    if (numIguales != 0) {
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
    let importe = numeral(award.valueAmountTotal).format(importeFormato, Math.ceil);
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
    $('#datos_subInfIzqAdjGI').html(htmlContent);

    pintaGraficoAwardImp(awardColIzq.slice(0, REGISTRO_GRAFICOS), 'chartAdjImp');
    pintaGraficoAwardImp(awardColIzq.slice(0, REGISTRO_GRAFICOS), 'chartAdjImp2');
    pintaGraficoAwardImp(awardColIzq.slice(0, REGISTRO_GRAFICOS), 'chartAdjImpGI');
    pintaGraficoAwardImp(awardColIzq.slice(0, REGISTRO_GRAFICOS), 'chartAdjImp2GI');
}

/*
Función que pinta el gráfico
*/
function pintaGraficoAwardImp(data, div) {
    if (LOG_DEGUB_BUSCADOR) {
        console.log('INFO pintaGraficoAwardImp');
    }

    am4core.useTheme(am4themes_frozen);
    am4core.useTheme(am4themes_animated);

    let chart = am4core.create(
        div,
        am4charts.XYChart
    );
    chart.colors.list = [
        am4core.color('#03045e'),
        am4core.color('#023e8a'),
        am4core.color('#0077b6'),
        am4core.color('#0096c7'),
        am4core.color('#00b4d8'),
        am4core.color('#48cae4'),
        am4core.color('#90e0ef'),
        am4core.color('#ade8f4'),
        am4core.color('#caf0f8'),
        am4core.color('#e3ecee')
    ];
    chart.data = data;
    chart.language.locale = am4lang_es_ES;

    chart.hiddenState.properties.opacity = 0;

    let categoryAxis = chart.yAxes.push(new am4charts.CategoryAxis());
    categoryAxis.dataFields.category = 'nameCompl';
    categoryAxis.renderer.grid.template.location = 0;
    categoryAxis.renderer.minGridDistance = 1;
    categoryAxis.renderer.inversed = true;
    categoryAxis.renderer.grid.template.disabled = true;

    let valueAxis = chart.xAxes.push(new am4charts.ValueAxis());
    valueAxis.min = 0;

    let series = chart.series.push(new am4charts.ColumnSeries());
    series.stroke = am4core.color('#ffffff'); // white
    series.strokeWidth = 1; // 1px
    series.dataFields.categoryY = 'nameCompl';
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

    if (div == 'chartAdjImp') {
        chart.exporting.menu = new am4core.ExportMenu();
        chart.exporting.menu.container = document.getElementById('exportAdjImp');
        chart.exporting.filePrefix = 'grafico';
        chart.exporting.menu.items = [{
            label: "<i class='fa fa-download fa-2'></i>",
            menu: [
                { type: 'csv', label: 'CSV' },
                { type: 'xlsx', label: 'XLSX' },
                { type: 'json', label: 'JSON' },
            ],
        }];
    } else if (chartAdjImpGI) {
        chart.exporting.menu = new am4core.ExportMenu();
        chart.exporting.menu.container = document.getElementById('exportAdjImpGI');
        chart.exporting.filePrefix = 'grafico';
        chart.exporting.menu.items = [{
            label: "<i class='fa fa-download fa-2'></i>",
            menu: [
                { type: 'csv', label: 'CSV' },
                { type: 'xlsx', label: 'XLSX' },
                { type: 'json', label: 'JSON' },
            ],
        }];
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

/*
Función que muestra u oculta la capa de la tabla de datos
*/
function mostrarDatosAwardImpGI() {
    if (LOG_DEGUB_BUSCADOR) {
        console.log('INFO mostrarDatosAwardImpGI');
    }

    $('#datos_subInfIzqAdjGI').toggle();
    if (!heightInicial) {
        heightInicial = $('#iframeBuscador', window.parent.document).height();
    }

    let isVisible = $('#datos_subInfIzqAdjGI').is(':visible');
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
contruyeAwardNum
*/
function contruyeAwardNum(value, key) {
    if (LOG_DEGUB_BUSCADOR) {
        console.log('INFO contruyeAwardNum');
    }
    let id = key;
    let nameCompl = '';
    let nameCorto = '';
    if (id) {
        nameCompl = organizationCol[key].title;
        nameCorto = nameCompl.substring(0, 30);
    }

    if(nameCompl) {
        let numIguales = 0;
        let d;
        for (d = 0; d < awardColDer.length; d++) {
            if (awardColDer[d].nameCorto.substring(0, 28) == nameCorto.substring(0, 28)) {
                numIguales = numIguales + 1;
            }
        }
        if (numIguales != 0) {
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
    $('#datos_subInfDerAdjGI').html(htmlContent);

    pintaGraficoAwardNum(awardColDer.slice(0, REGISTRO_GRAFICOS), 'chartAdjNum');
    pintaGraficoAwardNum(awardColDer.slice(0, REGISTRO_GRAFICOS), 'chartAdjNum2');
    pintaGraficoAwardNum(awardColDer.slice(0, REGISTRO_GRAFICOS), 'chartAdjNumGI');
    pintaGraficoAwardNum(awardColDer.slice(0, REGISTRO_GRAFICOS), 'chartAdjNum2GI');
}


/*
Función que pinta el gráfico
*/
function pintaGraficoAwardNum(data, div) {
    if (LOG_DEGUB_BUSCADOR) {
        console.log('INFO pintaGraficoAwardNum');
    }

    am4core.useTheme(am4themes_frozen);
    am4core.useTheme(am4themes_animated);

    let chart = am4core.create(div, am4charts.XYChart);
    chart.colors.list = [
        am4core.color('#757bc8'),
        am4core.color('#8187dc'),
        am4core.color('#8e94f2'),
        am4core.color('#9fa0ff'),
        am4core.color('#ada7ff'),
        am4core.color('#bbadff'),
        am4core.color('#cbb2fe'),
        am4core.color('#dab6fc'),
        am4core.color('#ddbdfc'),
        am4core.color('#e0c3fc')
    ];
    chart.data = data;
    chart.language.locale = am4lang_es_ES;

    chart.hiddenState.properties.opacity = 0;

    let categoryAxis = chart.yAxes.push(new am4charts.CategoryAxis());
    categoryAxis.dataFields.category = 'nameCompl';
    categoryAxis.renderer.grid.template.location = 0;
    categoryAxis.renderer.minGridDistance = 1;
    categoryAxis.renderer.inversed = true;
    categoryAxis.renderer.grid.template.disabled = true;

    let valueAxis = chart.xAxes.push(new am4charts.ValueAxis());
    valueAxis.min = 0;

    let series = chart.series.push(new am4charts.ColumnSeries());
    series.stroke = am4core.color('#ffffff');
    series.strokeWidth = 1;
    series.dataFields.categoryY = 'nameCompl';
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

    if (div == 'chartAdjNum') {

        chart.exporting.menu = new am4core.ExportMenu();
        chart.exporting.menu.container = document.getElementById('exportAdjNum');
        chart.exporting.filePrefix = 'grafico';
        chart.exporting.menu.items = [{
            label: "<i class='fa fa-download fa-2'></i>",
            menu: [
                { type: 'csv', label: 'CSV' },
                { type: 'xlsx', label: 'XLSX' },
                { type: 'json', label: 'JSON' },
            ]
        },
        ];
    } else if (div == 'chartAdjNumGI') {
        chart.exporting.menu = new am4core.ExportMenu();
        chart.exporting.menu.container = document.getElementById('exportAdjNumGI');
        chart.exporting.filePrefix = 'grafico';
        chart.exporting.menu.items = [{
            label: "<i class='fa fa-download fa-2'></i>",
            menu: [
                { type: 'csv', label: 'CSV' },
                { type: 'xlsx', label: 'XLSX' },
                { type: 'json', label: 'JSON' },
            ],
        }];
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
Función que muestra u oculta la capa de la tabla de datos
*/
function mostrarDatosAwardNumGI() {
    if (LOG_DEGUB_BUSCADOR) {
        console.log('INFO mostrarDatosAwardNumGI');
    }

    $('#datos_subInfDerAdjGI').toggle();
    if (!heightInicial) {
        heightInicial = $('#iframeBuscador', window.parent.document).height();
    }

    let isVisible = $('#datos_subInfDerAdjGI').is(':visible');
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
    am4core.useTheme(am4themes_animated);

    let chart = am4core.create(div, am4charts.TreeMap);
    chart.data = data;
    chart.language.locale = am4lang_es_ES;
    chart.layoutAlgorithm = chart.binaryTree;

    chart.dataFields.value = 'importe';
    chart.dataFields.name = 'tipo';

    let level1 = chart.seriesTemplates.create('0');
    let level1_column = level1.columns.template;

    level1_column.column.cornerRadius(2, 2, 2, 2);
    level1_column.fillOpacity = 0.8;
    level1_column.stroke = am4core.color('#fff');
    level1_column.strokeWidth = 1;
    level1_column.properties.tooltipText = '{name}: {value} €';

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

    chart.legend = new am4charts.Legend();
    chart.legend.maxWidth = 90;
    chart.legend.scrollable = true;
    chart.legend.position = 'right';

    if (div == 'chartTipAdj') {
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

    if (div == 'chartTipAdj') {
        chart.exporting.menu = new am4core.ExportMenu();
        chart.exporting.menu.container = document.getElementById('exportTipAdj');
        chart.exporting.filePrefix = 'grafico';
        chart.exporting.menu.items = [{
            label: "<i class='fa fa-download fa-2'></i>",
            menu: [
                { type: 'csv', label: 'CSV' },
                { type: 'xlsx', label: 'XLSX' },
                { type: 'json', label: 'JSON' },
            ]
        }];
    }
}

/*
Función que pinta el gráfico 
*/
function pintaGraficoTipAdjGI(data, div) {
    if (LOG_DEGUB_BUSCADOR) {
        console.log('INFO pintaGraficoTipAdjGI');
    }

    am4core.useTheme(am4themes_frozen);
    am4core.useTheme(am4themes_animated);

    let chart = am4core.create(div, am4charts.TreeMap);
    chart.data = data;
    chart.language.locale = am4lang_es_ES;
    chart.layoutAlgorithm = chart.binaryTree;

    chart.dataFields.value = 'importe';
    chart.dataFields.name = 'tipo';

    let level1 = chart.seriesTemplates.create('0');
    let level1_column = level1.columns.template;

    level1_column.column.cornerRadius(2, 2, 2, 2);
    level1_column.fillOpacity = 0.8;
    level1_column.stroke = am4core.color('#fff');
    level1_column.strokeWidth = 1;
    level1_column.properties.tooltipText = '{name}: {value} €';

    let level1_bullet2 = level1.bullets.push(new am4charts.LabelBullet());
    level1_bullet2.locationY = 0.5;
    level1_bullet2.locationX = 0.5;
    level1_bullet2.label.text = '{name}\n{value}€';
    level1_bullet2.label.fill = am4core.color('#222');
    level1_bullet2.label.truncate = false;

    level1_bullet2.label.padding(4, 10, 4, 10);
    level1_bullet2.label.fontSize = 20;
    level1_bullet2.layout = 'absolute';
    level1_bullet2.label.isMeasured = true;

    chart.legend = new am4charts.Legend();
    chart.legend.maxWidth = 90;
    chart.legend.scrollable = true;
    chart.legend.position = 'right';

    if (div == 'chartTipAdjGI') {
        level1_bullet2.events.on('ready', function (event) {
            let target = event.target;
            if (target.parent) {
                let pw = Number(target.maxWidth);
                let ph = Number(target.maxHeight);

                let label = target.children.getIndex(0);
                let tw = Number(label.measuredWidth);
                let th = Number(label.measuredHeight);
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

    if (div == 'chartTipAdjGI') {
        chart.exporting.menu = new am4core.ExportMenu();
        chart.exporting.menu.container = document.getElementById('exportTipAdjGI');
        chart.exporting.filePrefix = 'grafico';
        chart.exporting.menu.items = [{
            label: "<i class='fa fa-download fa-2'></i>",
            menu: [
                { type: 'csv', label: 'CSV' },
                { type: 'xlsx', label: 'XLSX' },
                { type: 'json', label: 'JSON' },
            ],
        }];
    }
}

/*
contruyeTipAdjImp
*/
function contruyeTipAdjImp(value, key) {
    if (LOG_DEGUB_BUSCADOR) {
        console.log('INFO contruyeTipAdjImp');
    }
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

/*
Función que muestra u oculta la capa de la tabla de datos
*/
function mostrarDatosTipAdjImpGI() {
    if (LOG_DEGUB_BUSCADOR) {
        console.log('INFO mostrarDatosTipAdjImpGI');
    }

    $('#datos_tablaTipAdjGI').toggle();
    if (!heightInicial) {
        heightInicial = $('#iframeBuscador', window.parent.document).height();
    }

    let isVisible = $('#datos_tablaTipAdjGI').is(':visible');
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
contruyeTipoContNum
*/
function contruyeTipoContNum(value, key) {
    if (LOG_DEGUB_BUSCADOR) {
        console.log('INFO contruyeTipoContNum');
    }
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
        console.log('INFO pintaGraficoTipoContNum');
    }

    am4core.useTheme(am4themes_frozen);
    am4core.useTheme(am4themes_animated);

    let chart = am4core.create(div, am4charts.PieChart);
    chart.colors.list = [
        am4core.color('#03045e'),
        am4core.color('#023e8a'),
        am4core.color('#0077b6'),
        am4core.color('#0096c7'),
        am4core.color('#00b4d8'),
        am4core.color('#48cae4'),
        am4core.color('#90e0ef'),
        am4core.color('#ade8f4'),
        am4core.color('#caf0f8'),
        am4core.color('#e3ecee')
    ];
    chart.data = importesTipos;
    chart.language.locale = am4lang_es_ES;

    let series = chart.series.push(new am4charts.PieSeries());
    series.dataFields.value = 'value';
    series.dataFields.category = 'name';

    series.labels.template.disabled = true;
    series.ticks.template.disabled = true;
    series.colors.step = 1;

    chart.innerRadius = am4core.percent(40);
    chart.startAngle = 180;
    chart.endAngle = 360;

    chart.legend = new am4charts.Legend();
    chart.legend.position = 'bottom';
    chart.legend.labels.template.maxWidth = 120;
    chart.legend.labels.template.truncate = true;
    chart.legend.itemContainers.template.tooltipText = '{category}';

    series.legendSettings.labelText = '{name}';
    series.legendSettings.valueText = '{value}';
    series.slices.template.tooltipText = '{name}: {value}';
    series.slices.template.cursorOverStyle = am4core.MouseCursorStyle.pointer;

    if (div == 'chartTipoContNum') {
        chart.exporting.menu = new am4core.ExportMenu();
        chart.exporting.menu.container = document.getElementById('exportTipoContNum');
        chart.exporting.filePrefix = 'grafico';
        chart.exporting.menu.items = [{
            label: "<i class='fa fa-download fa-2'></i>",
            menu: [
                { type: 'csv', label: 'CSV' },
                { type: 'xlsx', label: 'XLSX' },
                { type: 'json', label: 'JSON' },
            ],
        }];
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

/*
contruyeTipoContImp
*/
function contruyeTipoContImp(value, key) {
    if (LOG_DEGUB_BUSCADOR) {
        console.log('INFO contruyeTipoContImp');
    }
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
    am4core.useTheme(am4themes_animated);

    let chart = am4core.create(div, am4charts.PieChart);
    chart.data = importesTipos;
    chart.language.locale = am4lang_es_ES;

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
    series.legendSettings.valueText = '{value}€';
    series.slices.template.tooltipText = '{name}: {value} €';
    series.slices.template.cursorOverStyle = am4core.MouseCursorStyle.pointer;

    if (div == 'chartTipoContImp') {
        chart.exporting.menu = new am4core.ExportMenu();
        chart.exporting.menu.container = document.getElementById('exportTipoContImp');
        chart.exporting.filePrefix = 'grafico';
        chart.exporting.menu.items = [{
            label: "<i class='fa fa-download fa-2'></i>",
            menu: [
                { type: 'csv', label: 'CSV' },
                { type: 'xlsx', label: 'XLSX' },
                { type: 'json', label: 'JSON' },
            ],
        }];
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

/*
contruyeTipoProcNum
*/
function contruyeTipoProcNum(value, key) {
    if (LOG_DEGUB_BUSCADOR) {
        console.log('INFO contruyeTipoProcNum');
    }
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
    am4core.useTheme(am4themes_animated);

    let chart = am4core.create(div, am4charts.PieChart);
    chart.colors.list = [
        am4core.color('#03045e'),
        am4core.color('#023e8a'),
        am4core.color('#0077b6'),
        am4core.color('#0096c7'),
        am4core.color('#00b4d8'),
        am4core.color('#48cae4'),
        am4core.color('#90e0ef'),
        am4core.color('#ade8f4'),
        am4core.color('#caf0f8'),
        am4core.color('#e3ecee')
    ];
    chart.data = importesTipos;
    chart.language.locale = am4lang_es_ES;

    let series = chart.series.push(new am4charts.PieSeries());
    series.dataFields.value = 'value';
    series.dataFields.category = 'name';

    series.labels.template.disabled = true;
    series.ticks.template.disabled = false;

    series.colors.step = 1;

    chart.legend = new am4charts.Legend();
    chart.legend.position = 'bottom';
    chart.legend.labels.template.maxWidth = 120;
    chart.legend.labels.template.truncate = true;
    chart.legend.itemContainers.template.tooltipText = '{category}';

    chart.innerRadius = am4core.percent(40);
    chart.startAngle = 180;
    chart.endAngle = 360;

    series.legendSettings.labelText = '{name}';
    series.legendSettings.valueText = '{value}';
    series.slices.template.tooltipText = '{name}: {value}';
    series.slices.template.cursorOverStyle = am4core.MouseCursorStyle.pointer;

    if (div == 'chartTipoProcNum') {
        chart.exporting.menu = new am4core.ExportMenu();
        chart.exporting.menu.container = document.getElementById('exportTipoProcNum');
        chart.exporting.filePrefix = 'grafico';
        chart.exporting.menu.items = [{
            label: "<i class='fa fa-download fa-2'></i>",
            menu: [
                { type: 'csv', label: 'CSV' },
                { type: 'xlsx', label: 'XLSX' },
                { type: 'json', label: 'JSON' },
            ],
        }];
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

/*
contruyeTipoProcImp
*/
function contruyeTipoProcImp(value, key) {
    if (LOG_DEGUB_BUSCADOR) {
        console.log('INFO contruyeTipoProcImp');
    }
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
    am4core.useTheme(am4themes_animated);

    let chart = am4core.create(div, am4charts.PieChart);
    chart.data = importesTipos;
    chart.language.locale = am4lang_es_ES;

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
    series.legendSettings.valueText = '{value}€';
    series.slices.template.tooltipText = '{name}: {value} €';
    series.slices.template.cursorOverStyle = am4core.MouseCursorStyle.pointer;

    if (div == 'chartTipoProcImp') {
        chart.exporting.menu = new am4core.ExportMenu();
        chart.exporting.menu.container = document.getElementById('exportTipoProcImp');
        chart.exporting.filePrefix = 'grafico';
        chart.exporting.menu.items = [{
            label: "<i class='fa fa-download fa-2'></i>",
            menu: [
                { type: 'csv', label: 'CSV' },
                { type: 'xlsx', label: 'XLSX' },
                { type: 'json', label: 'JSON' },
            ],
        }];
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
obtieneDatoIndicadorNumLicitaciones
*/
function obtieneDatoIndicadorNumLicitaciones(url) {
    if (LOG_DEGUB_BUSCADOR) {
        console.log('INFO obtieneDatoIndicadorNumLicitaciones | ' + url);
    }
    $.getJSON(url)
        .done(function (data) {
            if (data && data.records && data.records.length) {
                let i;
                for (i = 0; i < data.records.length; i++) {
                    numLic = numLic + Number(data.records[i].contador);
                }
                if (data.next) {
                    obtieneDatoIndicadorNumLicitaciones(dameURL(data.next));
                } else {
                    let nLicitaciones = numeral(numLic);
                    $('#numLicitaciones').html(nLicitaciones.format());
                    modificaIndicadoresLicitaciones(0);
                }
            } else {
                console.log(MSG_ERROR_API_RES_VACIO);
            }
        })
        .fail(function (jqxhr, textStatus, error) {
            let err = textStatus + ', ' + error;
            console.error('Request Failed: ' + err);

        }
        );
}

/*
obtieneDatoIndicadorImpLicitaciones
 */
function obtieneDatoIndicadorImpLicitaciones(url) {
    if (LOG_DEGUB_BUSCADOR) {
        console.log('INFO obtieneDatoIndicadorImpLicitaciones | ' + url);
    }
    $.getJSON(url)
        .done(function (data) {
            if (data && data.records && data.records.length) {
                let i;
                for (i = 0; i < data.records.length; i++) {
                    impLic = impLic + Number(data.records[i].suma);
                }
                if (data.next) {
                    obtieneDatoIndicadorImpLicitaciones(dameURL(data.next));
                } else {
                    let sImporteLicitaciones = numeral(impLic);
                    $('#importeLicitaciones').html(
                        sImporteLicitaciones.format(importeFormato, Math.ceil)
                    );
                    modificaIndicadoresLicitaciones(1);
                }
            } else {
                console.log(MSG_ERROR_API_RES_VACIO);
            }
        })
        .fail(function (jqxhr, textStatus, error) {
            let err = textStatus + ', ' + error;
            console.error('Request Failed: ' + err);

        }
        );
}

/*
obtieneDatoIndicadorNumAdjudicaciones
*/
function obtieneDatoIndicadorNumAdjudicaciones(url) {
    if (LOG_DEGUB_BUSCADOR) {
        console.log('INFO obtieneDatoIndicadorNumAdjudicaciones | ' + url);
    }
    $.getJSON(url)
        .done(function (data) {
            if (data && data.records && data.records.length) {
                let i;
                numAdj = data.totalRecords;
                let nAdjudicatarios = numeral(numAdj);
                $('#numAdjudicatarios').html(nAdjudicatarios.format());
                modificaIndicadoresAdjudicaciones(0);

            } else {
                console.log(MSG_ERROR_API_RES_VACIO);
            }
        })
        .fail(function (jqxhr, textStatus, error) {
            let err = textStatus + ', ' + error;
            console.error('Request Failed: ' + err);

        }
        );
}

/*
obtieneDatoIndicadorImpAdjudicaciones
*/
function obtieneDatoIndicadorImpAdjudicaciones(url) {
    if (LOG_DEGUB_BUSCADOR) {
        console.log('INFO obtieneDatoIndicadorImpAdjudicaciones | ' + url);
    }
    $.getJSON(url)
        .done(function (data) {
            if (data && data.records && data.records.length) {
                let i;
                for (i = 0; i < data.records.length; i++) {
                    impAdj = impAdj + Number(data.records[i].contador);
                }
                if (data.next) {
                    obtieneDatoIndicadorImpAdjudicaciones(dameURL(data.next));
                } else {
                    let sImporteAdjudicatarios = numeral(impAdj);
                    $('#importeAdjudicatarios').html(
                        sImporteAdjudicatarios.format(importeFormato, Math.ceil)
                    );
                    modificaIndicadoresAdjudicaciones(1);
                    obtieneDatoIndicador3Linea2(INDICADOR3_LINEA2_URL)
                }
            } else {
                console.log(MSG_ERROR_API_RES_VACIO);
            }
        })
        .fail(function (jqxhr, textStatus, error) {
            let err = textStatus + ', ' + error;
            console.error('Request Failed: ' + err);

        }
        );
}

/*
Funcion que modifica un attributo del objeto taskmaster del padre (si existe)
*/
function modificaIndicadoresLicitaciones(attr) {
    if (LOG_DEGUB_BUSCADOR) {
        console.log('INFO modificaIndicadoresLicitaciones | ' + attr);
    }
    if (indicadoresLicitaciones) {
        indicadoresLicitaciones[attr] = true;
        checkIndicadoresLicitaciones();
    }
}

/*
checkIndicadoresLicitaciones
*/
function checkIndicadoresLicitaciones() {
    if (LOG_DEGUB_BUSCADOR) {
        console.log('INFO checkPeticionesIniciales');
    }

    if (!indicadoresLicitaciones) {
        return false;
    }

    if (!indicadoresLicitaciones[0]) {
        return false;
    }
    if (!indicadoresLicitaciones[1]) {
        return false;
    }

    setTimeout(function () {
        insertaIndicadoresLicitaciones();
    }, 0);
}

/*
insertaIndicadoresLicitaciones
*/
function insertaIndicadoresLicitaciones() {
    if (LOG_DEGUB_BUSCADOR) {
        console.log('INFO insertaIndicadoresLicitaciones');
    }
    let simporteMedLicitaciones = numeral(impLic / numLic);
    $('#importeMedLicitaciones').html(
        simporteMedLicitaciones.format(importeFormato, Math.ceil)
    );
}

/*
Funcion que modifica un attributo del objeto taskmaster del padre (si existe)
*/
function modificaIndicadoresAdjudicaciones(attr) {
    if (LOG_DEGUB_BUSCADOR) {
        console.log('INFO modificaIndicadoresAdjudicaciones | ' + attr);
    }
    if (indicadoresAdjudicaciones) {
        indicadoresAdjudicaciones[attr] = true;
        checkIndicadoresAdjudicaciones();
    }
}

function checkIndicadoresAdjudicaciones() {
    if (LOG_DEGUB_BUSCADOR) {
        console.log('INFO checkIndicadoresAdjudicaciones');
    }

    if (!indicadoresAdjudicaciones) {
        return false;
    }

    if (!indicadoresAdjudicaciones[0]) {
        return false;
    }
    if (!indicadoresAdjudicaciones[1]) {
        return false;
    }

    setTimeout(function () {
        insertaIndicadoresAdjudicaciones();
    }, 0);
}

/*
insertaIndicadoresAdjudicaciones
*/
function insertaIndicadoresAdjudicaciones() {
    if (LOG_DEGUB_BUSCADOR) {
        console.log('INFO insertaIndicadoresLicitaciones');
    }
    let simpMedAdjudicatarios = numeral(impAdj / numAdj);
    $('#importeMedAdjudicatarios').html(
        simpMedAdjudicatarios.format(importeFormato, Math.ceil)
    );
}

/*
obtieneDatoIndicador1Linea2
*/
function obtieneDatoIndicador1Linea2(url) {
    if (LOG_DEGUB_BUSCADOR) {
        console.log('INFO obtieneDatoIndicador1Linea2 | ' + url);
    }
    $.getJSON(dameURL(url))
        .done(function (data) {
            if (data && data.records && data.records.length) {
                let dato1 = 0;
                let numTotal = 0;
                let i;
                for (i = 0; i < data.records.length; i++) {
                    numTotal = numTotal + Number(data.records[i].contador);
                    if (data.records[i].procurementMethod == INDICADOR_1_TIPO_PROCEDIMIENTO) {
                        dato1 = data.records[i].contador;
                    }
                }
                if (data.next) {
                    obtieneDatoIndicador1Linea2(dameURL(data.next));
                } else {
                    let pnumProc1 = numeral((dato1 * 100) / numTotal);
                    $('#porcentajeProcemimento1').html(pnumProc1.format(numFormato, Math.ceil));
                    $('#indTipoProcedimiento1').html(
                        ETIQUETA_TIP_PROC.get(INDICADOR_1_TIPO_PROCEDIMIENTO)
                    );
                }
            } else {
                console.log(MSG_ERROR_API_RES_VACIO);
            }
        })
        .fail(function (jqxhr, textStatus, error) {
            let err = textStatus + ', ' + error;
            console.error('Request Failed: ' + err);

        }
        );
}

/*
obtieneDatoIndicador2Linea2
*/
function obtieneDatoIndicador2Linea2(url) {
    if (LOG_DEGUB_BUSCADOR) {
        console.log('INFO obtieneDatoIndicador2Linea2 | ' + url);
    }
    $.getJSON(dameURL(url))
        .done(function (data) {
            if (data && data.records && data.records.length) {
                let dato2 = 0;
                let numTotal = 0;
                let i;
                for (i = 0; i < data.records.length; i++) {
                    numTotal = numTotal + Number(data.records[i].contador);
                    if (data.records[i].procurementMethod == INDICADOR_2_TIPO_PROCEDIMIENTO) {
                        dato2 = data.records[i].contador;
                    }
                }
                if (data.next) {
                    obtieneDatoIndicador2Linea2(dameURL(data.next));
                } else {
                    let pnumProc2 = numeral((dato2 * 100) / numTotal);
                    $('#porcentajeProcemimento2').html(pnumProc2.format(numFormato, Math.ceil));
                    $('#indTipoProcedimiento2').html(
                        ETIQUETA_TIP_PROC.get(INDICADOR_2_TIPO_PROCEDIMIENTO)
                    );
                }
            } else {
                console.log(MSG_ERROR_API_RES_VACIO);
            }
        })
        .fail(function (jqxhr, textStatus, error) {
            let err = textStatus + ', ' + error;
            console.error('Request Failed: ' + err);

        }
        );
}

/*
obtieneDatoIndicador3Linea2
*/
function obtieneDatoIndicador3Linea2(url) {
    if (LOG_DEGUB_BUSCADOR) {
        console.log('INFO obtieneDatoIndicador3Linea2 | ' + url);
    }
    $.getJSON(dameURL(url))
        .done(function (data) {
            if (data && data.records && data.records.length) {
                let diezImpAwardMayorSuma = 0;
                let i;
                for (i = 0; i < data.records.length; i++) {
                    diezImpAwardMayorSuma =
                        Number(diezImpAwardMayorSuma) + Number(data.records[i].contador);
                }
                let sdiezImpAwardMayor = numeral((diezImpAwardMayorSuma * 100) / impAdj);
                $('#porcentajeDiezContratosMayor').html(
                    sdiezImpAwardMayor.format(numFormato, Math.ceil)
                );
                cambioCapaGeneral();
                $('#modalCargaInicial').modal('hide');

            } else {
                console.log(MSG_ERROR_API_RES_VACIO);
            }
        })
        .fail(function (jqxhr, textStatus, error) {
            let err = textStatus + ', ' + error;
            console.error('Request Failed: ' + err);

        }
        );
}

/*
obtieneDatoIndicadorNumAnual
*/
function obtieneDatoIndicadorNumAnual(url) {
    if (LOG_DEGUB_BUSCADOR) {
        console.log('INFO obtieneDatoIndicadorNumAnual | ' + url);
    }
    $.getJSON(url)
        .done(function (data) {
            if (data && data.records && data.records.length) {
                let i;
                for (i = 0; i < data.records.length; i++) {
                    let indicadorGlobal = {
                        numAdj: 0,
                        impAdj: 0,
                        anyo: 0,
                    };
                    indicadorGlobal.numAdj = data.records[i].contador;
                    indicadorGlobal.anyo = data.records[i].anyo;
                    indicadoresAnualTemp[data.records[i].anyo] = indicadorGlobal;
                }
                if (data.next) {
                    obtieneDatoIndicadorNumAnual(dameURL(data.next));
                } else {
                    obtieneDatoIndicadorImpAnual(INDICADOR_IMP_ANUAL)
                }
            } else {
                console.log(MSG_ERROR_API_RES_VACIO);
            }
        })
        .fail(function (jqxhr, textStatus, error) {
            let err = textStatus + ', ' + error;
            console.error('Request Failed: ' + err);

        }
        );
}

/*
obtieneDatoIndicadorImpAnual
*/
function obtieneDatoIndicadorImpAnual(url) {
    if (LOG_DEGUB_BUSCADOR) {
        console.log('INFO obtieneDatoIndicadorImpAnual | ' + url);
    }
    $.getJSON(dameURL(url))
        .done(function (data) {
            if (data && data.records && data.records.length) {
                let i;
                for (i = 0; i < data.records.length; i++) {
                    indicadoresAnualTemp[data.records[i].anyo].impAdj = data.records[i].suma;
                    indicadoresAnualGlobales.push(indicadoresAnualTemp[data.records[i].anyo]);
                }
                if (data.next) {
                    obtieneDatoIndicadorImpAnual(dameURL(data.next));
                } else {
                    pintaGraficoIndicadoresGlobales(indicadoresAnualGlobales, 'chartdiv');
                    pintaGraficoIndicadoresGlobales(indicadoresAnualGlobales, 'chartdiv2');
                    pintaGraficoIndicadoresGlobales(indicadoresAnualGlobales, 'chartdivGI');
                    pintaGraficoIndicadoresGlobales(indicadoresAnualGlobales, 'chartdiv2GI');
                }
            } else {
                console.log(MSG_ERROR_API_RES_VACIO);
            }
        })
        .fail(function (jqxhr, textStatus, error) {
            let err = textStatus + ', ' + error;
            console.error('Request Failed: ' + err);

        }
        );
}

/*
obtieneDatoGrafAdjImp
*/
function obtieneDatoGrafAdjImp(url) {
    if (LOG_DEGUB_BUSCADOR) {
        console.log('INFO obtieneDatoGrafAdjImp | ' + url);
    }
    $.getJSON(url)
        .done(function (data) {
            if (data && data.records && data.records.length) {
                let i;
                for (i = 0; i < data.records.length; i++) {
                    let id = data.records[i].isSupplierFor;
                    let value = data.records[i].suma;
                    let award = {
                        id: id,
                        nameCompl: id,
                        nameCorto: id,
                        valueAmountTotal: value,
                    };
                    let importe = numeral(award.valueAmountTotal).format(importeFormato, Math.ceil);
                    award.importe = importe;
                    awardColIzq.push(award);
                    awardAdjImp[id] = award;
                }
                obtieneDatoNombreAdjImp(awardColIzq, awardAdjImp);
            } else {
                console.log(MSG_ERROR_API_RES_VACIO);
            }
        })
        .fail(function (jqxhr, textStatus, error) {
            let err = textStatus + ', ' + error;
            console.error('Request Failed: ' + err);

        }
        );
}

/*
obtieneDatoNombreAdjImp
*/
function obtieneDatoNombreAdjImp(awardColIzq, awardAdjImp) {

    let url = NOMBRE_ADJUDICATARIO_IMP_URL_1;
    let endUrl = NOMBRE_ADJUDICATARIO_IMP_URL_2;
    if (LOG_DEGUB_BUSCADOR) {
        console.log('INFO obtieneDatoGrafAdjImp | ' + url);
    }
    let i;
    for (i = 0; i < awardColIzq.length; i++) {
        url = url + awardColIzq[i].id;
        if ((i + 1) != awardColIzq.length) {
            url = url + ',';
        }
    }
    awardColIzq = [];
    $.getJSON(dameURL(url + endUrl))
        .done(function (data) {
            if (data && data.records && data.records.length) {
                let i;
                for (i = 0; i < data.records.length; i++) {
                    let award = awardAdjImp[data.records[i].id];
                    let nameCorto = data.records[i].title.substring(0, 30);
                    let nameCompl = data.records[i].title;
                    let numIguales = 0;

                    for (d = 0; d < awardColIzq.length; d++) {
                        if (awardColIzq[d].nameCorto.substring(0, 28) == nameCorto.substring(0, 28)) {
                            numIguales = numIguales + 1;
                        }
                    }
                    if (numIguales != 0) {
                        nameCorto = nameCompl.substring(0, 28) + '~' + numIguales;
                    }

                    award.nameCompl = nameCompl;
                    award.nameCorto = nameCorto;
                    awardColIzq.push(award);
                }
                awardColIzq.sort(compareImp);
                pintaGraficoAwardImp(awardColIzq.slice(0, REGISTRO_GRAFICOS), 'chartAdjImp');
                pintaGraficoAwardImp(awardColIzq.slice(0, REGISTRO_GRAFICOS), 'chartAdjImp2');
                pintaGraficoAwardImp(awardColIzq.slice(0, REGISTRO_GRAFICOS), 'chartAdjImpGI');
                pintaGraficoAwardImp(awardColIzq.slice(0, REGISTRO_GRAFICOS), 'chartAdjImp2GI');
            } else {
                console.log(MSG_ERROR_API_RES_VACIO);
            }
        })
        .fail(function (jqxhr, textStatus, error) {
            let err = textStatus + ', ' + error;
            console.error('Request Failed: ' + err);

        }
        );
}

/*
obtieneDatoGrafAdjNum
*/
function obtieneDatoGrafAdjNum(url) {
    if (LOG_DEGUB_BUSCADOR) {
        console.log('INFO obtieneDatoGrafAdjNum | ' + url);
    }
    $.getJSON(url)
        .done(function (data) {
            if (data && data.records && data.records.length) {
                let i;
                for (i = 0; i < data.records.length; i++) {
                    let id = data.records[i].isSupplierFor;
                    let value = data.records[i].contador;
                    let award = {
                        id: id,
                        nameCompl: id,
                        nameCorto: id,
                        numTotal: Number(value),
                    };
                    let num = numeral(value).format(numFormatoSinDecimales, Math.ceil);
                    award.value = num;
                    awardColDer.push(award);
                    awardAdjNum[id] = award;
                }
                obtieneDatoNombreAdjNum(awardColDer, awardAdjNum);
            } else {
                console.log(MSG_ERROR_API_RES_VACIO);
            }
        })
        .fail(function (jqxhr, textStatus, error) {
            let err = textStatus + ', ' + error;
            console.error('Request Failed: ' + err);

        }
        );
}

/*
obtieneDatoNombreAdjNum
*/
function obtieneDatoNombreAdjNum(awardColDer, awardAdjNum) {

    let url = NOMBRE_ADJUDICATARIO_NUM_URL_1;
    let endUrl = NOMBRE_ADJUDICATARIO_NUM_URL_2
    if (LOG_DEGUB_BUSCADOR) {
        console.log('INFO obtieneDatoNombreAdjNum | ' + url);
    }
    let i;
    for (i = 0; i < awardColDer.length; i++) {
        url = url + awardColDer[i].id;
        if ((i + 1) != awardColDer.length) {
            url = url + ',';
        }
    }
    awardColDer = [];
    $.getJSON(dameURL(url + endUrl))
        .done(function (data) {
            if (data && data.records && data.records.length) {
                let i;
                let numIguales = 0;
                for (i = 0; i < data.records.length; i++) {
                    let award = awardAdjNum[data.records[i].id];
                    if(award.nameCompl!=''){
                        let nameCorto = data.records[i].title.substring(0, 30);
                        let nameCompl = data.records[i].title;
                        let d;
                        for (d = 0; d < awardColDer.length; d++) {
                            if (awardColDer[d].nameCorto.substring(0, 28) == nameCorto.substring(0, 28)) {
                                numIguales = numIguales + 1;
                            }
                        }
                        if (numIguales != 0) {
                            nameCorto = nameCompl.substring(0, 28) + '~' + numIguales;
                        }

                        award.nameCompl = nameCompl;
                        award.nameCorto = nameCorto;
                        awardColDer.push(award);
                    }
                    
                }

                awardColDer.sort(compareNum);
                pintaGraficoAwardNum(awardColDer.slice(0, REGISTRO_GRAFICOS), 'chartAdjNum');
                pintaGraficoAwardNum(awardColDer.slice(0, REGISTRO_GRAFICOS), 'chartAdjNum2');
                pintaGraficoAwardNum(awardColDer.slice(0, REGISTRO_GRAFICOS), 'chartAdjNumGI');
                pintaGraficoAwardNum(awardColDer.slice(0, REGISTRO_GRAFICOS), 'chartAdjNum2GI');
            } else {
                console.log(MSG_ERROR_API_RES_VACIO);
            }
        })
        .fail(function (jqxhr, textStatus, error) {
            let err = textStatus + ', ' + error;
            console.error('Request Failed: ' + err);
        }
        );
}

/*
obtieneDatoGrafTipAdj
*/
function obtieneDatoGrafTipAdj(url) {
    if (LOG_DEGUB_BUSCADOR) {
        console.log('INFO obtieneDatoGrafTipAdj | ' + url);
    }
    $.getJSON(url)
        .done(function (data) {
            if (data && data.records && data.records.length) {
                let i;
                for (i = 0; i < data.records.length; i++) {
                    let fistChar = ETIQUETA_TIPO_ENTIDAD.get(data.records[i].tipo);

                    if (fistChar) {
                        let importe = data.records[i].importe;

                        let tipoImp = {
                            tipo: fistChar,
                            importe: importe,
                        };

                        tipAdjCol.push(tipoImp);
                    }
                }
                pintaGraficoTipAdj(tipAdjCol, 'chartTipAdj');
                pintaGraficoTipAdj(tipAdjCol, 'chartTipAdj2');
            } else {
                console.log(MSG_ERROR_API_RES_VACIO);
            }
        })
        .fail(function (jqxhr, textStatus, error) {
            let err = textStatus + ', ' + error;
            console.error('Request Failed: ' + err);

        }
        );
}

/*
obtieneDatoAdjEnLic
*/
function obtieneDatoAdjEnLic(url) {
    if (LOG_DEGUB_BUSCADOR) {
        console.log('INFO obtieneDatoAdjEnLic | ' + url);
    }
    $.getJSON(dameURL(url))
        .done(function (data) {
            if (data && data.records && data.records.length) {
                let i;
                for (i = 0; i < data.records.length; i++) {
                    awardEnTenderSet.add( data.records[i]);
                }
                if (data.next) {
                    obtieneDatoAdjEnLic(dameURL(data.next));
                } else {
                    
                }
            } else {
                console.log(MSG_ERROR_API_RES_VACIO);
            }
        })
        .fail(function (jqxhr, textStatus, error) {
            let err = textStatus + ', ' + error;
            console.error('Request Failed: ' + err);
        }
    );
}

/*
obtieneDatoGrafCatNum
*/
function obtieneDatoGrafCatNum(url) {
    if (LOG_DEGUB_BUSCADOR) {
        console.log('INFO obtieneDatoGrafCatNum | ' + url);
    }
    $.getJSON(dameURL(url))
        .done(function (data) {
            if (data && data.records && data.records.length) {
                let i;
                for (i = 0; i < data.records.length; i++) {
                    let key = data.records[i].mainProcurementCategory;
                    let value = data.records[i].contador;

                    let catNum = {
                        name: ETIQUETA_TIP_CONT.get(key),
                        value: value,
                    };

                    tipoContNumCol.push(catNum);
                }

                pintaGraficoTipoContNum(tipoContNumCol, 'chartTipoContNum');
                pintaGraficoTipoContNum(tipoContNumCol, 'chartTipoContNum2');
            } else {
                console.log(MSG_ERROR_API_RES_VACIO);
            }
        })
        .fail(function (jqxhr, textStatus, error) {
            let err = textStatus + ', ' + error;
            console.error('Request Failed: ' + err);
        }
        );
}

/*
obtieneDatoGrafCatImp
*/
function obtieneDatoGrafCatImp(url) {
    if (LOG_DEGUB_BUSCADOR) {
        console.log('INFO obtieneDatoGrafCatImp | ' + url);
    }
    $.getJSON(dameURL(url))
        .done(function (data) {
            if (data && data.records && data.records.length) {
                let i;
                for (i = 0; i < data.records.length; i++) {
                    let key = data.records[i].mainProcurementCategory;
                    let value = data.records[i].contador;

                    let catImp = {
                        name: ETIQUETA_TIP_CONT.get(key),
                        value: value,
                    };

                    tipoContImpCol.push(catImp);
                }

                pintaGraficoTipoContImp(tipoContImpCol, 'chartTipoContImp');
                pintaGraficoTipoContImp(tipoContImpCol, 'chartTipoContImp2');
            } else {
                console.log(MSG_ERROR_API_RES_VACIO);
            }
        })
        .fail(function (jqxhr, textStatus, error) {
            let err = textStatus + ', ' + error;
            console.error('Request Failed: ' + err);
        }
        );
}

/*
obtieneDatoGrafProNum
*/
function obtieneDatoGrafProNum(url) {
    if (LOG_DEGUB_BUSCADOR) {
        console.log('INFO obtieneDatoGrafProNum | ' + url);
    }
    $.getJSON(dameURL(url))
        .done(function (data) {
            if (data && data.records && data.records.length) {
                let i;
                for (i = 0; i < data.records.length; i++) {
                    let key = data.records[i].procurementMethod;
                    let value = data.records[i].contador;

                    let proNum = {
                        name: ETIQUETA_TIP_PROC.get(key),
                        value: value,
                    };

                    tipoProcNumCol.push(proNum);
                }

                pintaGraficoTipoProcNum(tipoProcNumCol, 'chartTipoProcNum');
                pintaGraficoTipoProcNum(tipoProcNumCol, 'chartTipoProcNum2');
            } else {
                console.log(MSG_ERROR_API_RES_VACIO);
            }
        })
        .fail(function (jqxhr, textStatus, error) {
            let err = textStatus + ', ' + error;
            console.error('Request Failed: ' + err);
        }
        );
}

/*
obtieneDatoGrafProImp
*/
function obtieneDatoGrafProImp(url) {
    if (LOG_DEGUB_BUSCADOR) {
        console.log('INFO obtieneDatoGrafProImp | ' + url);
    }
    $.getJSON(dameURL(url))
        .done(function (data) {
            if (data && data.records && data.records.length) {
                let i;
                for (i = 0; i < data.records.length; i++) {
                    let key = data.records[i].procurementMethod;
                    let value = data.records[i].contador;

                    let proNum = {
                        name: ETIQUETA_TIP_PROC.get(key),
                        value: value,
                    };

                    tipoProcImpCol.push(proNum);
                }

                pintaGraficoTipoProcImp(tipoProcImpCol, 'chartTipoProcImp');
                pintaGraficoTipoProcImp(tipoProcImpCol, 'chartTipoProcImp2');
            } else {
                console.log(MSG_ERROR_API_RES_VACIO);
            }
        })
        .fail(function (jqxhr, textStatus, error) {
            let err = textStatus + ', ' + error;
            console.error('Request Failed: ' + err);
        }
        );
}

/*
compareTitle
*/
function compareTitle(a, b) {
    if (LOG_DEGUB_BUSCADOR) {
        console.log('INFO compareTitle');
    }
    if (a.titleClean < b.titleClean) return -1;
    if (b.titleClean < a.titleClean) return 1;

    return 0;
}

/*
compareImp
*/
function compareImp(a, b) {
    if (LOG_DEGUB_BUSCADOR) {
        console.log('INFO compareImp');
    }
    if (a.valueAmountTotal > b.valueAmountTotal) return -1;
    if (b.valueAmountTotal > a.valueAmountTotal) return 1;

    return 0;
}

/*
compareNum
*/
function compareNum(a, b) {
    if (LOG_DEGUB_BUSCADOR) {
        console.log('INFO compareNum ');
    }
    if (a.numTotal > b.numTotal) return -1;
    if (b.numTotal > a.numTotal) return 1;

    return 0;
}