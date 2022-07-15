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
Algunas letiables que se usan en este javascript se inicializan en ciudadesAbiertas.js
*/

// Variables para almacenar los parámetros de la URL
var paramId;
var paramCapaAnterior;

// Variables para almacenar la información de contratos
var process = {};
var organizationBuyer = {};
var tender = {};
var tenderRelItemCol = [];
var lotCol = [];

/*
Función de inicialización del script
*/
function inicializaFichaContrato() {
    if (LOG_DEGUB_FICHA_CONTRATO) {
        console.log('inicializaFichaContrato');
    }

    inicializaMultidiomaFichaContrato();
}

/* 
Función para inicializar el multidioma
*/
function inicializaMultidiomaFichaContrato() {
    if (LOG_DEGUB_FICHA_CONTRATO) {
        console.log('inicializaMultidiomaFichaContrato');
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
                en: './dist/i18n/en.json',
                es: './dist/i18n/es.json',
                gl: './dist/i18n/gl.json',
            })
            .done(function () {
                $('html').i18n();
                inicializaDatosFichaContrato();
            });
    });

    $.i18n.debug = LOG_DEGUB_FICHA_CONTRATO;
}

/*
Función que invoca a todas las funciones que se realizan al inicializar el script
*/
function inicializaDatosFichaContrato() {
    if (LOG_DEGUB_FICHA_CONTRATO) {
        console.log('inicializaDatosFichaContrato');
    }
    capturaParam();
    inicializaDatos();
}

/*
Función que comprueba y captura si se han pasado parámetros a la web, en caso de haberlos ejecutará una búsqueda con ellos.
*/
function capturaParam() {
    if (LOG_DEGUB_FICHA_CONTRATO) {
        console.log('capturaParam');
    }

    paramId = getUrlVars()['id'];
    if (getUrlVars()['id']) {
        paramId = decodeURI(paramId);
    }

    paramCapaAnterior = getUrlVars()['capaAnterior'];
    if (paramId) {
        paramCapaAnterior = decodeURI(paramCapaAnterior);
    }
}

/*
Función que iniciliza los datos que dependen de la API
*/
function inicializaDatos() {
    if (LOG_DEGUB_FICHA_CONTRATO) {
        console.log('inicializaDatos');
    }

    $('#liLotes').hide();
    $('#etiquetaLotesA').hide();
    $('#bloqueAdjudicacion').hide();

    if (paramId) {
        obtieneDatosAPIProcess(dameURL(PROCESS_URL_1 + '/' + paramId + PROCESS_URL_2));
    }
}

/*
Función que iniciliza los datos que dependen de la API
*/
function obtieneDatosAPIProcess(url) {
    if (LOG_DEGUB_FICHA_CONTRATO) {
        console.log('obtieneDatosAPIProcess | ' + url);
    }

    $.getJSON(dameURL(url))
        .done(function (data) {
            if (data && data.records && data.records.length) {
                let i;
                for (i = 0; i < data.records.length; i++) {
                    process = {
                        id: data.records[i].id,
                        identifier: data.records[i].identifier,
                        title: data.records[i].title,
                        isBuyerFor: data.records[i].isBuyerFor,
                        hasTender: data.records[i].hasTender,
                        url: data.records[i].url,
                        description: data.records[i].description,
                    };

                    $('#expediente').html(process.identifier);
                    $('#titulo').html(process.title);
                    $('#url').attr('href', process.url);

                    if (!data.records[i].url) {
                        $('#bloqueLicitacion').hide();
                    }
                }

                obtieneDatosAPIOrganizationBuyer(
                    dameURL(
                        ORGANIZATION_URL_1 + '/' + process.isBuyerFor + ORGANIZATION_URL_2
                    )
                );
                obtieneDatosAPITender(
                    dameURL(TENDER_URL_1 + '/' + process.hasTender + TENDER_URL_2)
                );
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
function obtieneDatosAPIOrganizationBuyer(url) {
    if (LOG_DEGUB_FICHA_CONTRATO) {
        console.log('obtieneDatosAPIOrganizationBuyer | ' + url);
    }

    $.getJSON(dameURL(url))
        .done(function (data) {
            if (data && data.records && data.records.length) {
                let i;
                for (i = 0; i < data.records.length; i++) {
                    organizationBuyer = {
                        id: data.records[i].id,
                        title: data.records[i].title,
                    };

                    $('#enlaceOrganismoC').html(organizationBuyer.title);
                    $('#enlaceOrganismoC').attr('href', '');
                    $('#enlaceOrganismoC').on('click', function () {
                        abrirFichaOrganizacion(organizationBuyer.id);
                    });
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
function obtieneDatosAPIOrganizationAward(url, valueAmount, title) {
    if (LOG_DEGUB_FICHA_CONTRATO) {
        console.log(
            'obtieneDatosAPIOrganizationAward | ' +
                url +
                ' , ' +
                title +
                ' , ' +
                valueAmount
        );
    }

    $.getJSON(dameURL(url))
        .done(function (data) {
            if (data && data.records && data.records.length) {
                let i;
                for (i = 0; i < data.records.length; i++) {
                    let organizationAward = {
                        id: data.records[i].id,
                        title: data.records[i].title,
                    };

                    let bloqueHTML = '';
                    let bloqueHTMLli1 = "<li>";
                    let bloqueHTMLli2 = "</li>";
                    let bloqueHTMLp11 = "<p>";
                    let bloqueHTMLp12 = "</p>";
                    let bloqueHTMLImporte = "<b>" + $.i18n("importe:") + " </b>";
                    let bloqueHTMLLic0 =
                        '<p><i class="fa fa-thumbs-up"></i><a href=""';
                    let bloqueHTMLLic1 = '" onclick=abrirFichaAdjudicatario("';
                    let bloqueHTMLLic2 = '")>';
                    let bloqueHTMLLic3 = "</a></p>";
                    if (title) {
                        $('#liLotes').show();
                        $('#etiquetaLotesA').show();
                    } else {
                        $('#liLotes').hide();
                        $('#etiquetaLotesA').hide();
                    }

                    bloqueHTML = $('#licitadores').html();
                    bloqueHTML = bloqueHTML + bloqueHTMLli1;
                    if (title) {
                        bloqueHTML = bloqueHTML + bloqueHTMLp11 + title + bloqueHTMLp12;
                    }
                    bloqueHTML =
                        bloqueHTML +
                        bloqueHTMLLic0 +
                        organizationAward.id +
                        bloqueHTMLLic1 +
                        organizationAward.id +
                        bloqueHTMLLic2 +
                        organizationAward.title +
                        bloqueHTMLLic3;
                    if (valueAmount) {
                        let importe = numeral(valueAmount).format(
                            importeFormato,
                            Math.ceil
                        );
                        bloqueHTML =
                            bloqueHTML +
                            bloqueHTMLp11 +
                            bloqueHTMLImporte +
                            importe +
                            bloqueHTMLp12;
                    }
                    bloqueHTML = bloqueHTML + bloqueHTMLli2;
                    $('#licitadores').html(bloqueHTML);
                }
                lotCol;
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
    if (LOG_DEGUB_FICHA_CONTRATO) {
        console.log('obtieneDatosAPITender | ' + url);
    }

    $.getJSON(dameURL(url))
        .done(function (data) {
            if (data && data.records && data.records.length) {
                let i;
                for (i = 0; i < data.records.length; i++) {
                    tender = {
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
                        periodDurationInDays: data.records[i].periodDurationInDays,
                        anyo: '',
                    };
                    if (tender.periodStartDate) {
                        tender.anyo = Date.parse(tender.periodStartDate).toString('yyyy');
                    } else if (tender.periodEndDate) {
                        tender.anyo = Date.parse(tender.periodEndDate).toString('yyyy');
                    }

                    $('#periodoinicio').html(
                        Date.parse(tender.periodStartDate).toString('dd-MM-yyyy')
                    );
                    $('#periodofin').html(
                        Date.parse(tender.periodEndDate).toString('dd-MM-yyyy')
                    );
                    $('#tipo').html(
                        ETIQUETA_TIP_CONT.get(tender.mainProcurementCategory)
                    );
                    $('#procedimiento').html(
                        ETIQUETA_TIP_PROC.get(tender.procurementMethod)
                    );
                    if (tender.anyo) {
                        $('#anyo').html(tender.anyo);
                    } else {
                        $('#parrafoAnyo').hide();
                    }

                    if (tender.periodDurationInDays) {
                        $('#ejecucion').html(tender.periodDurationInDays + ' días');
                        $('#duraccion').html(tender.periodDurationInDays + ' días');
                    } else {
                        $('#bloqueEjecucion').hide();
                        $('#parrafoDuracion').hide();
                    }

                    if (tender.numberOfTenderers) {
                        $('#numLicitadores').html(tender.numberOfTenderers);
                    } else {
                        $('#parrafoLicitadores').hide();
                    }

                    $('#estado').html(ETIQUETA_ESTADO.get(tender.tenderStatus));
					
					if (tender.valueAmount) {
                        $('#importe').html(
                        numeral(tender.valueAmount).format(importeFormato, Math.ceil));
                    } else {
                        $('#parrafoImporte').hide();
                    }
                    
                }
                if (tender.hasSupplier) {
                    $('#bloqueAdjudicacion').show();
                    obtieneDatosAPIAward(
                        dameURL(AWARD_URL_1 + '/' + tender.hasSupplier + AWARD_URL_2)
                    );
                }
                obtieneDatosAPILot(
                    dameURL(LOT_TENDER_ID_URL_1 + tender.id + LOT_TENDER_ID_URL_2)
                );
                obtieneDatosAPITenderRelItem(
                    dameURL(
                        TENDER_REL_ITEM_TENDER_ID_URL_1 +
                            tender.id +
                            TENDER_REL_ITEM_TENDER_ID_URL_2
                    )
                );
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
    if (LOG_DEGUB_FICHA_CONTRATO) {
        console.log('obtieneDatosAPIAward | ' + url);
    }

    $.getJSON(dameURL(url))
        .done(function (data) {
            if (data && data.records && data.records.length) {
                let i;
                for (i = 0; i < data.records.length; i++) {
                    let valueAmount;
                    let award = {
                        id: data.records[i].id,
                        isSupplierFor: data.records[i].isSupplierFor,
                        awardDate: data.records[i].awardDate,
                        valueAmount: data.records[i].valueAmount,
                        description: data.records[i].description,
                    };
                    valueAmount = award.valueAmount;

                    if (award.isSupplierFor) {
                        obtieneDatosAPIOrganizationAward(
                            dameURL(
                                ORGANIZATION_URL_1 +
                                    '/' +
                                    award.isSupplierFor +
                                    ORGANIZATION_URL_2
                            ),
                            valueAmount
                        );
                    } else {
                        if (award.description && award.description) {
                            let bloqueHTML = "";
                            let bloqueHTMLli1 = "<li>";
                            let bloqueHTMLli2 = "</li>";
                            let bloqueHTMLp11 = "<p>";
                            let bloqueHTMLp12 = "</p>";

                            $('#liLotes').hide();
                            $('#etiquetaLotesA').hide();
                            bloqueHTML = $('#licitadores').html();

                            bloqueHTML =
                                bloqueHTML +
                                bloqueHTMLli1 +
                                bloqueHTMLp11 +
                                award.description +
                                bloqueHTMLp12 +
                                bloqueHTMLli2;
                            $('#licitadores').html(bloqueHTML);
                        }
                    }
                }
                if (data.next) {
                    obtieneDatosAPIAward(dameURL(data.next));
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
function obtieneDatosAPIAwardLot(url, lot) {
    if (LOG_DEGUB_FICHA_CONTRATO) {
        console.log('obtieneDatosAPIAwardLot | ' + url + ' , ' + lot);
    }

    $.getJSON(dameURL(url))
        .done(function (data) {
            if (data && data.records && data.records.length) {
                let award;
                let i;
                for (i = 0; i < data.records.length; i++) {
                    award = {
                        id: data.records[i].id,
                        isSupplierFor: data.records[i].isSupplierFor,
                        awardDate: data.records[i].awardDate,
                        valueAmount: data.records[i].valueAmount,
                        description: data.records[i].description,
                    };

                    if (award.isSupplierFor) {
                        obtieneDatosAPIOrganizationAward(
                            dameURL(
                                ORGANIZATION_URL_1 +
                                    '/' +
                                    award.isSupplierFor +
                                    ORGANIZATION_URL_2
                            ),
                            award.valueAmount,
                            lot.title
                        );
                    }
                }
                if (data.next) {
                    obtieneDatosAPIAward(data.next);
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
    if (LOG_DEGUB_FICHA_CONTRATO) {
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

                    let bloqueHTML = "";
                    let bloqueHTML1 = "<li>";
                    let bloqueHTML2 = "</li>";
                    bloqueHTML = $('#cpv').html().replace('/t', '').replace('/n', '');

                    if (item.description) {
                        bloqueHTML =
                            bloqueHTML +
                            bloqueHTML1 +
                            item.hasClassification +
                            ' - ' +
                            item.description +
                            bloqueHTML2;
                    } else {
                        bloqueHTML =
                            bloqueHTML + bloqueHTML1 + item.hasClassification + bloqueHTML2;
                    }

                    $('#cpv').html(bloqueHTML);
                }
                if (data.next) {
                    obtieneDatosAPIItem(dameURL(data.next));
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
    if (LOG_DEGUB_FICHA_CONTRATO) {
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

                    obtieneDatosAPIItem(
                        dameURL(ITEM_URL_1 + '/' + tenderRelItem.item + ITEM_URL_2)
                    );
                }
                if (data.next) {
                    obtieneDatosAPITenderRelItem(dameURL(data.next));
                } else {
                    scrollTop();
                    $('.modal').modal('hide');
                }
            } else {
                console.log(MSG_ERROR_API_RES_VACIO);
                scrollTop();
                $('.modal').modal('hide');
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
    if (LOG_DEGUB_FICHA_CONTRATO) {
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

                    let bloqueHTML = "";
                    let bloqueHTMLli1 = "<li>";
                    let bloqueHTMLli2 = "</li>";
                    let bloqueHTMLp11 = "<p>";
                    let bloqueHTMLp12 = "</p>";
                    let bloqueHTMLImporte =
                        "<b>" + $.i18n("importe-licitacion:") + " </b>";
                    bloqueHTML = $('#lotesPliego').html();
                    bloqueHTML = bloqueHTML + bloqueHTMLli1;
                    bloqueHTML = bloqueHTML + bloqueHTMLp11 + lot.title + bloqueHTMLp12;
                    let importe = numeral(lot.valueAmount).format(
                        importeFormato,
                        Math.ceil
                    );
                    bloqueHTML =
                        bloqueHTML +
                        bloqueHTMLp11 +
                        bloqueHTMLImporte +
                        importe +
                        bloqueHTMLp12;
                    bloqueHTML = bloqueHTML + bloqueHTMLli2;
                    $('#lotesPliego').html(bloqueHTML);

                    if (lot.hasSupplier) {
                        $('#bloqueAdjudicacion').show();
                        obtieneDatosAPIAwardLot(
                            dameURL(AWARD_URL_1 + '/' + lot.hasSupplier + AWARD_URL_2),
                            lot
                        );
                    }
                }
                if (data.next) {
                    obtieneDatosAPILot(data.next);
                }
            } else if (data && data.records && !data.records.length) {
                $('#liLotes').hide();
                $('#etiquetaLotesA').hide();
            }
        })
        .fail(function (jqxhr, textStatus, error) {
            let err = textStatus + ', ' + error;
            console.error('Request Failed: ' + err);
        });
}

/*
Función que permite ocultar la ficha
*/
function volverBusqueda() {
    if (LOG_DEGUB_FICHA_CONTRATO) {
        console.log('volverBusqueda');
    }

    if (paramCapaAnterior == 'buscador') {
        $('#capaBuscador', window.parent.document).show();
        $('#capaAyuda', window.parent.document).hide();
        $('#capaFichaContrato', window.parent.document).hide();
        $('#capaFichaAdjudicatario', window.parent.document).hide();
        $('#capaFichaOrganizacionContratante', window.parent.document).hide();
    }
    if (paramCapaAnterior == 'inicio') {
        $('#capaBuscador', window.parent.document).hide();
        $('#capaAyuda', window.parent.document).hide();
        $('#capaFichaContrato', window.parent.document).hide();
        $('#capaFichaAdjudicatario', window.parent.document).hide();
        $('#capaFichaOrganizacionContratante', window.parent.document).hide();
    }
    if (paramCapaAnterior == 'fichaAdjudicatario') {
        $('#capaBuscador', window.parent.document).show();
        $('#capaAyuda', window.parent.document).hide();
        $('#capaFichaContrato', window.parent.document).hide();
        $('#capaFichaAdjudicatario', window.parent.document).show();
        $('#capaFichaOrganizacionContratante', window.parent.document).hide();
    }
    if (paramCapaAnterior == 'fichaContrato') {
        $('#capaBuscador', window.parent.document).hide();
        $('#capaAyuda', window.parent.document).hide();
        $('#capaFichaContrato', window.parent.document).show();
        $('#capaFichaAdjudicatario', window.parent.document).hide();
        $('#capaFichaOrganizacionContratante', window.parent.document).hide();
    }
    if (paramCapaAnterior == 'fichaOrganizacionContratante') {
        $('#capaBuscador', window.parent.document).hide();
        $('#capaAyuda', window.parent.document).hide();
        $('#capaFichaContrato', window.parent.document).hide();
        $('#capaFichaAdjudicatario', window.parent.document).hide();
        $('#capaFichaOrganizacionContratante', window.parent.document).show();
    }
}

/*
abrirFichaAdjudicatario
*/
function abrirFichaAdjudicatario(id) {
    if (LOG_DEGUB_FICHA_CONTRATO) {
        console.log('abrirFichaAdjudicatario');
    }

    let url = 'fichaAdjudicatario.html?lang=' + $.i18n().locale;
    url = url + '&id=' + id + '&capaAnterior=fichaContrato';

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

/*
abrirFichaOrganizacion
*/
function abrirFichaOrganizacion(id) {
    if (LOG_DEGUB_FICHA_CONTRATO) {
        console.log('abrirFichaOrganizacion');
    }

    let url = 'fichaOrganizacionContratante.html?lang=' + $.i18n().locale;
    url = url + '&id=' + id + '&capaAnterior=fichaContrato';

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
}
