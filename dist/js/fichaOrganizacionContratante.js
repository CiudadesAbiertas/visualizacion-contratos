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

// Estructura para saber cuando han acabado las peticiones ajax iniciales
var peticionesIniciales = [false, false, false, false];

// Variables para almacenar los parámetros de la URL
var paramId;
var paramCapaAnterior;

// Variables para almacenar la información de contratos
var processCol = [];
var processOrgCol = [];
var organizationCol = [];
var tenderCol = [];
var tenderAnyoCol = [];
var anyoCol = [];
var numContratosCol = [];
var numContratos = 0;
var numContratosGrafCol = [];
var numContratosTotal = 0;
var importeContratosCol = [];
var importeContratosTotal = 0;
var importeContratos = 0;
var importeContratosGrafCol = [];
var awardCol = [];
var lotCol = [];

// Variable para almacenar el contenido de la tabla
var dataSet = [];

/*
                Función de inicialización del script
*/
function inicializaFichaOrgContratante() {
    if (LOG_DEGUB_FICHA_ORG_CONTRATANTE) {
        console.log("inicializaFichaOrgContratante");
    }

    inicializaMultidiomaFichaOrgContratante();
}

/* 
                Función para inicializar el multidioma
*/
function inicializaMultidiomaFichaOrgContratante() {
    if (LOG_DEGUB_FICHA_ORG_CONTRATANTE) {
        console.log("inicializaMultidiomaFichaOrgContratante");
    }

    let langUrl = getUrlVars()["lang"];
    if (!langUrl) {
        langUrl = "es";
    }
    $.i18n().locale = langUrl;
    document.documentElement.lang = $.i18n().locale;
    $("html").i18n();

    jQuery(function ($) {
        $.i18n()
            .load({
                en: "./dist/i18n/en.json",
                es: "./dist/i18n/es.json",
                gl: "./dist/i18n/gl.json",
            })
            .done(function () {
                $("html").i18n();
                inicializaDatosFichaOrgContratante();
                preparaTablaFichaOrgCont();
            });
    });

    $.i18n.debug = LOG_DEGUB_FICHA_ORG_CONTRATANTE;
}

/*
                Función que invoca a todas las funciones que se realizan al inicializar el script
*/
function inicializaDatosFichaOrgContratante() {
    if (LOG_DEGUB_FICHA_ORG_CONTRATANTE) {
        console.log("inicializaDatosFichaOrgContratante");
    }
    capturaParam();
    inicializaDatos();
    $("#buscarListado").click(function () {
        buscar();
        this.blur();
    });
    $("#iframeFichaOrganizacionContratante", window.parent.document).height(1371);
}

/*
                Función que comprueba y captura si se han pasado parámetros a la web, en caso de haberlos ejecutará una búsqueda con ellos.
*/
function capturaParam() {
    if (LOG_DEGUB_FICHA_ORG_CONTRATANTE) {
        console.log("capturaParam");
    }

    if (getUrlVars()["id"]) {
        paramId = getUrlVars()["id"];
    }

    paramCapaAnterior = getUrlVars()["capaAnterior"];
    if (paramCapaAnterior) {
        paramCapaAnterior = decodeURI(paramCapaAnterior);
    }
}

/* Función que realiza la búsqueda de la tabla */
function buscar() {
    if (LOG_DEGUB_FICHA_ORG_CONTRATANTE) {
        console.log("buscar");
    }

    let anyoBusqueda = "";
    let estadoBusqueda = "";
    if ($("#selectAnyo").val()) {
        anyoBusqueda = $("#selectAnyo").val();
    }
    if ($("#selectEstado").val()) {
        estadoBusqueda = $("#selectEstado").val();
    }
    creaDatasetTabla(paramId, anyoBusqueda, estadoBusqueda);
    $(".table-responsive").show();
    let table = $("#tablaOrgContr").DataTable();
    table.clear();
    table.rows.add(dataSet).draw();
}

/*
                Función que iniciliza los datos que dependen de la API
*/
function inicializaDatos() {
    if (LOG_DEGUB_FICHA_ORG_CONTRATANTE) {
        console.log("inicializaDatos");
    }

    if (paramId) {
        obtieneDatosAPIProcess(PROCESS_BUYER_ID_1 + paramId + PROCESS_BUYER_ID_2);
        obtieneDatosAPIOrganization(ORGANIZATION_URL_1 + ORGANIZATION_URL_2);
        obtieneDatosAPITender(TENDER_URL_1 + TENDER_URL_2);
        obtieneDatosAPIAward(dameURL(AWARD_URL_1 + AWARD_URL_2));
        obtieneDatosAPILot(dameURL(LOT_URL_1 + LOT_URL_2));
    }
}

/*
                Función que iniciliza los datos que dependen de la API
*/
function obtieneDatosAPIProcess(url) {
    if (LOG_DEGUB_FICHA_ORG_CONTRATANTE) {
        console.log("obtieneDatosAPIProcess | " + url);
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

                    let processOrgColAux = [];
                    if (processOrgCol[process.isBuyerFor]) {
                        processOrgColAux = processOrgCol[process.isBuyerFor];
                    }
                    processOrgColAux.push(process);
                    processOrgCol[process.isBuyerFor] = processOrgColAux;
                }
                if (data.next) {
                    obtieneDatosAPIProcess(data.next);
                } else {
                    modificaPeticionesInicialesr(0);
                }
            } else {
                console.log(MSG_ERROR_API_RES_VACIO);
            }
        })
        .fail(function (jqxhr, textStatus, error) {
            let err = textStatus + ", " + error;
            console.error("Request Failed: " + err);
        });
}

/*
                Función que iniciliza los datos que dependen de la API
*/
function obtieneDatosAPIOrganization(url) {
    if (LOG_DEGUB_FICHA_ORG_CONTRATANTE) {
        console.log("obtieneDatosAPIOrganization | " + url);
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
                    if (paramId == organization.id) {
                        $("#titulo").html(data.records[i].title);
                    }
                    organizationCol[organization.id] = organization;
                }
                if (data.next) {
                    obtieneDatosAPIOrganization(data.next);
                } else {
                    modificaPeticionesInicialesr(1);
                }
            } else {
                console.log(MSG_ERROR_API_RES_VACIO);
            }
        })
        .fail(function (jqxhr, textStatus, error) {
            let err = textStatus + ", " + error;
            console.error("Request Failed: " + err);
        });
}

/*
                Función que iniciliza los datos que dependen de la API
*/
function obtieneDatosAPITender(url) {
    if (LOG_DEGUB_FICHA_ORG_CONTRATANTE) {
        console.log("obtieneDatosAPITender | " + url);
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
                        anyo: "",
                    };
                    if (tender.periodStartDate) {
                        tender.anyo = Date.parse(tender.periodStartDate).toString("yyyy");
                    } else if (tender.periodEndDate) {
                        tender.anyo = Date.parse(tender.periodEndDate).toString("yyyy");
                    } else {
                        tender.anyo = "";
                    }
                    if (tender.anyo && !anyoCol.includes(tender.anyo)) {
                        anyoCol.push(tender.anyo);
                    }

                    tenderCol[tender.id] = tender;

                    let tenderAnyoColAux = [];
                    if (tenderAnyoCol[tender.anyo + ""]) {
                        tenderAnyoColAux = tenderAnyoCol[tender.anyo];
                    }
                    tenderAnyoColAux.push(tender);
                    tenderAnyoCol[tender.anyo + ""] = tenderAnyoColAux;
                }
                if (data.next) {
                    obtieneDatosAPITender(data.next);
                } else {
                    modificaPeticionesInicialesr(2);
                    anyoCol.sort();
                }
            } else {
                console.log(MSG_ERROR_API_RES_VACIO);
            }
        })
        .fail(function (jqxhr, textStatus, error) {
            let err = textStatus + ", " + error;
            console.error("Request Failed: " + err);
        });
}

/*
                Función que iniciliza los datos que dependen de la API
*/
function obtieneDatosAPIAward(url) {
    if (LOG_DEGUB_FICHA_ORG_CONTRATANTE) {
        console.log("obtieneDatosAPIAward | " + url);
    }

    if (LOG_DEGUB_BUSCADOR) {
        console.log("obtieneDatosAPIAward | " + url);
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
                    modificaPeticionesInicialesr(3);
                }
            } else {
                console.log(MSG_ERROR_API_RES_VACIO);
            }
        })
        .fail(function (jqxhr, textStatus, error) {
            let err = textStatus + ", " + error;
            console.error("Request Failed: " + err);
        });
}

/*
                Función que iniciliza los datos que dependen de la API
*/
function obtieneDatosAPILot(url) {
    if (LOG_DEGUB_BUSCADOR) {
        console.log("obtieneDatosAPILot | " + url);
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
                    modificaPeticionesInicialesr(4);
                }
            } else {
                console.log(MSG_ERROR_API_RES_VACIO);
            }
        })
        .fail(function (jqxhr, textStatus, error) {
            let err = textStatus + ", " + error;
            console.error("Request Failed: " + err);
        });
}

/*
Funcion que modifica un attributo del objeto taskmaster del padre (si existe) 
*/
function modificaPeticionesInicialesr(attr) {
    if (LOG_DEGUB_FICHA_ORG_CONTRATANTE) {
        console.log("modificaPeticionesInicialesr " + attr);
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
    if (LOG_DEGUB_FICHA_ORG_CONTRATANTE) {
        console.log("checkPeticionesIniciales");
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

    setTimeout(function () {
        insertaDatosIniciales();
    }, 500);
}

/*
                Función que invoca a todas las funciones que se realizan al inicializar el script
*/
function insertaDatosIniciales() {
    if (LOG_DEGUB_FICHA_ORG_CONTRATANTE) {
        console.log("insertaDatosIniciales");
    }

    trataDatosPorAnyo();
    pintaGráficoNumContratos(numContratosGrafCol);
    pintaGráficoImpContratos(importeContratosGrafCol);
    creaDatasetTabla(paramId, "", "");
    $(".table-responsive").show();
    let table = $("#tablaOrgContr").DataTable();
    table.clear();
    table.rows.add(dataSet).draw();
    preparaTablaFichaOrgCont();
    $("#iframeFichaOrganizacionContratante", window.parent.document).height(
        $(document).height()
    );
    scrollTop();
    $(".modal").modal("hide");
}

function trataDatosPorAnyo() {
    if (LOG_DEGUB_FICHA_ORG_CONTRATANTE) {
        console.log("trataDatosPorAnyo");
    }

    let numContratos = 0;
    let numContratosTotal = 0;
    let importeContratos = 0;
    let importeContratosTotal2 = 0;
    let processOrgColAux = processOrgCol[paramId];
    let tenderAnyoColAux;

    $("#selectAnyo")
        .empty()
        .append('<option value=""></option>')
        .attr("selected", "selected");
    let a;
    for (a = 0; a < anyoCol.length; a++) {
        numContratos = 0;
        importeContratos = 0;
        let anyoIndicador = anyoCol[a];
        $("#selectAnyo").append(
            '<option value="' + anyoIndicador + '">' + anyoIndicador + "</option>"
        );
        tenderAnyoColAux = tenderAnyoCol[anyoIndicador];
        if (tenderAnyoColAux) {
            let b;
            for (b = 0; b < processOrgColAux.length; b++) {
                let process = processOrgColAux[b];
                let c;
                for (c = 0; c < tenderAnyoColAux.length; c++) {
                    let tender = tenderAnyoColAux[c];
                    if (process.hasTender == tender.id) {
                        numContratos = numContratos + 1;
                        numContratosTotal = numContratosTotal + 1;
                        importeContratosTotal2 = Number(importeContratosTotal2) + Number(tender.valueAmount);
                        importeContratos = importeContratos + tender.valueAmount;
                    }
                }
            }
        }
        numContratosCol[anyoIndicador] = numContratos;
        let numContratosGraf = {
            anyoIndicador: anyoIndicador,
            numContratos: numContratos,
        };
        numContratosGrafCol.push(numContratosGraf);
        importeContratosCol[anyoIndicador] = importeContratos;
        let importeContratosGraf = {
            anyoIndicador: anyoIndicador,
            importeContratos: importeContratos,
        };
        importeContratosGrafCol.push(importeContratosGraf);
    }

    $("#numContratos").html(numContratosTotal);
    let importe = numeral(importeContratosTotal2).format(
        importeFormato,
        Math.ceil
    );
    $("#impContratos").html(importe);
    
    numContratosGrafCol.sort(function (a, b) {
        return a.anyoIndicador - b.anyoIndicador;
    });
    importeContratosGrafCol.sort(function (a, b) {
        return a.anyoIndicador - b.anyoIndicador;
    });
}

/*
                Función que pinta el gráfico
*/
function pintaGráficoNumContratos(data1) {
    if (LOG_DEGUB_FICHA_ORG_CONTRATANTE) {
        console.log("pintaGráficoNumContratos");
    }

    am4core.useTheme(am4themes_frozen);
    am4core.useTheme(am4themes_animated);

    let chart = am4core.create("chartdivTree1", am4charts.XYChart);
    chart.data = data1;
    chart.language.locale = am4lang_es_ES;

    let categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
    categoryAxis.dataFields.category = "anyoIndicador";
    categoryAxis.renderer.grid.template.location = 0;
    categoryAxis.renderer.minGridDistance = 1;

    let valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
    valueAxis.min = 0;

    let series = chart.series.push(new am4charts.ColumnSeries());
    series.dataFields.valueY = "numContratos";
    series.dataFields.categoryX = "anyoIndicador";
    series.columns.template.tooltipText = "{categoryX}: [bold]{valueY}[/]";
    series.columns.template.fillOpacity = 0.8;

    let columnTemplate = series.columns.template;
    columnTemplate.strokeWidth = 2;
    columnTemplate.strokeOpacity = 1;
}

/*
                Función que pinta el gráfico
*/
function pintaGráficoImpContratos(data2) {
    if (LOG_DEGUB_FICHA_ORG_CONTRATANTE) {
        console.log("pintaGráficoImpContratos");
    }

    am4core.useTheme(am4themes_frozen);
    am4core.useTheme(am4themes_animated);

    let chart = am4core.create("chartdivTree2", am4charts.XYChart);
    chart.data = data2;
    chart.language.locale = am4lang_es_ES;

    let categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
    categoryAxis.dataFields.category = "anyoIndicador";
    categoryAxis.renderer.grid.template.location = 0;
    categoryAxis.renderer.minGridDistance = 1;

    let valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
    valueAxis.min = 0;

    let series = chart.series.push(new am4charts.ColumnSeries());
    series.dataFields.valueY = "importeContratos";
    series.dataFields.categoryX = "anyoIndicador";
    series.columns.template.tooltipText = "{categoryX}: [bold]{valueY}€[/]";
    series.columns.template.fillOpacity = 0.8;

    let columnTemplate = series.columns.template;
    columnTemplate.strokeWidth = 2;
    columnTemplate.strokeOpacity = 1;
}

function creaDatasetTabla(organismoCIdBusqueda, anyoBusqueda, estadoBusqueda) {
    if (LOG_DEGUB_FICHA_ORG_CONTRATANTE) {
        console.log("creaDatasetTabla | " + anyoBusqueda + " , " + estadoBusqueda);
    }

    dataSet = [];
    let posResult = 0;

    let resultadoAnyo = true;
    let resultadoEstado = true;
    let resultadoCId = true;
    let i;
    for (i = 0; i < processCol.length; i++) {
        let id = "";
        let identifier = "";
        let nombre = "";
        let nombreCompl = "";
        let anyo = "";
        let categoria = "";
        let estado = "";
        let organismoCId = "";
        let organismoCTitle = "";
        let nlicitadores = "";
        let licitador = "";
        let licitadorId = "";
        let importePliego = "";
        let nombreLote = "";
        let importeLote = "";
        let importeAdj = "";
        let insertado = false;
        let orgContratante = {
            importePliego: 0,
        };

        if (anyoBusqueda) {
            resultadoAnyo = false;
        }
        if (estadoBusqueda) {
            resultadoEstado = false;
        }
        if (organismoCIdBusqueda) {
            resultadoCId = false;
        }

        if (processCol[i]) {
            if (processCol[i].id) {
                id = processCol[i].id;
                identifier = processCol[i].identifier;
            }
            if (processCol[i].title) {
                nombre = processCol[i].title.substring(0,LIMITE_NOMBRE_CONTRATO);
                nombreCompl = processCol[i].title;
            }
        }
        if (processCol[i] && tenderCol[processCol[i].hasTender]) {
            if (tenderCol[processCol[i].hasTender].anyo) {
                anyo = tenderCol[processCol[i].hasTender].anyo;
                if (anyo == anyoBusqueda) {
                    resultadoAnyo = true;
                }
            }
            if (tenderCol[processCol[i].hasTender].mainProcurementCategory) {
                categoria = tenderCol[processCol[i].hasTender].mainProcurementCategory;
            }
            if (tenderCol[processCol[i].hasTender].tenderStatus) {
                estado = tenderCol[processCol[i].hasTender].tenderStatus;
                if (estado == estadoBusqueda) {
                    resultadoEstado = true;
                }
            }
            if (tenderCol[processCol[i].hasTender].numberOfTenderers) {
                nlicitadores = tenderCol[processCol[i].hasTender].numberOfTenderers;
            }
            if (tenderCol[processCol[i].hasTender].valueAmount) {
                importePliego = tenderCol[processCol[i].hasTender].valueAmount;
                orgContratante.importePliego = importePliego;
            }
        }

        if (
            tenderCol[processCol[i].hasTender].hasSupplier &&
            awardCol[tenderCol[processCol[i].hasTender].hasSupplier]
        ) {
            if (
                awardCol[tenderCol[processCol[i].hasTender].hasSupplier].isSupplierFor
            ) {
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
                    licitadorId =
                        awardCol[tenderCol[processCol[i].hasTender].hasSupplier]
                            .isSupplierFor;
                }
            }
        }

        if (organizationCol[processCol[i].isBuyerFor]) {
            if (organizationCol[processCol[i].isBuyerFor].title) {
                organismoCTitle = organizationCol[processCol[i].isBuyerFor].title;
            }
            if (organizationCol[processCol[i].isBuyerFor].id) {
                organismoCId = organizationCol[processCol[i].isBuyerFor].id;
                if (organismoCId == organismoCIdBusqueda) {
                    resultadoCId = true;
                }
            }
        }

        if (lotCol[tenderCol[processCol[i].hasTender].id]) {
            let lotAux = lotCol[tenderCol[processCol[i].hasTender].id];
            let j;
            for (j = 0; j < lotAux.length; j++) {
                if (lotAux[j].title) {
                    nombreLote = lotAux[j].title;
                }
                if (lotAux[j].valueAmount) {
                    importeLote = lotAux[j].valueAmount;
                }
                if (lotAux[j].hasSupplier) {
                    if (awardCol[lotAux[j].hasSupplier].valueAmount) {
                        importeAdj = awardCol[lotAux[j].hasSupplier].valueAmount;
                    }

                    if (awardCol[lotAux[j].hasSupplier].isSupplierFor) {
                        if (
                            organizationCol[awardCol[lotAux[j].hasSupplier].isSupplierFor]
                        ) {
                            licitador =
                                organizationCol[awardCol[lotAux[j].hasSupplier].isSupplierFor]
                                    .title;
                            licitadorId = awardCol[lotAux[j].hasSupplier].isSupplierFor;
                        }

                        awardCol[lotAux[j].hasSupplier];
                    }
                }

                if (resultadoCId && resultadoAnyo && resultadoEstado) {
                    dataSet[posResult] = [
                        id,
                        identifier,
                        nombre,
                        importePliego,
                        estado,
                        categoria,
                        licitador,
                        nlicitadores,
                        licitadorId,
                        nombreLote,
                        importeLote,
                        importeAdj,
                        nombreCompl
                    ];
                    posResult = posResult + 1;
                    insertado = true;
                    numContratosTotal = numContratosTotal + 1;
                    importeContratosTotal = Number(importeContratosTotal) + Number(importePliego);
                }
            }
        }

        if (resultadoCId && resultadoAnyo && resultadoEstado && !insertado) {
            dataSet[posResult] = [
                id,
                identifier,
                nombre,
                importePliego,
                estado,
                categoria,
                licitador,
                nlicitadores,
                licitadorId,
                nombreLote,
                importeLote,
                importeAdj,
                nombreCompl
            ];
            posResult = posResult + 1;
            numContratosTotal = numContratosTotal + 1;
            importeContratosTotal = Number(importeContratosTotal) + Number(importePliego);
        }
    }

    // $("#numContratos").html(numContratosTotal);
    // let importe = numeral(importeContratosTotal).format(
    //     importeFormato,
    //     Math.ceil
    // );
    // $("#impContratos").html(importe);
}

/*
                Función que inicializa la tabla de búsqueda
*/
function preparaTablaFichaOrgCont(segundaPasada) {
    if (LOG_DEGUB_FICHA_ORG_CONTRATANTE) {
        console.log("preparaTablaFichaOrgCont");
    }

    let expedienteCadena = "";
    let nombreCadena = "";
    let categoriaCadena = "";
    let estadoCadena = "";
    let numeroLicitadoresCadena = "";
    let adjudicatarioCadena = "";
    let importePliegoCadena = "";
    let copyCadena = "";
    let modificarTablaCadena = $.i18n("modificar_tabla");
    let descargarCadena = $.i18n("descargar");

    expedienteCadena = $.i18n("n_expediente");
    nombreCadena = $.i18n("nombre");
    categoriaCadena = $.i18n("categoria");
    estadoCadena = $.i18n("estado");
    numeroLicitadoresCadena = $.i18n("numero_licitadores");
    adjudicatarioCadena = $.i18n("adjudicatario");
    importePliegoCadena = $.i18n("importe");
    let nombreLoteCadena = $.i18n("nombre_lote");
    let importeLoteCadena = $.i18n("importe_lote");
    let importeAdjCadena = $.i18n("importe_adjudicado");
    let showHideCadena = $.i18n("Oculta columnas");

    copyCadena = $.i18n("copiar");
    let urlLanguaje = "vendor/datatables/i18n/" + $.i18n().locale + ".json";

    let tablaOrgContr = $("#tablaOrgContr").DataTable({
        searching: false,
        pageLength: REGISTROS_TABLA_BUSQUEDA,
        formatNumber: function (toFormat) {
            return toFormat.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
        },
        formatNumber: function (toFormat) {
            return toFormat.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
        },
        language: {
            decimal: ",",
            thousands: ".",
            url: urlLanguaje,
        },
        data: dataSet,
        order: [0, "asc"],
        columnDefs: [
            { width: "70", targets: 1 },
            { width: "90", targets: 2 },
            { width: "1", targets: 3 },
            { width: "90", targets: 4 },
            { width: "1", targets: 5 },
            { width: "1", targets: 6 },
            { width: "250", targets: 7 },
            { width: "1", targets: 8 },
            { width: "1", targets: 9 },
        ],
        columns: [
            {
                title: expedienteCadena,
                render: function (data, type, row) {
                    return (
                        '<a id="fichaContrato" aria-label="Abrir ficha" >' + row[1] + "</a>"
                    );
                },
                className: "details-control",
            },
            {
                title: nombreCadena,
                render: function (data, type, row) {
                    return row[2];
                },
            },
            {
                title: importePliegoCadena,
                render: function (data, type, row) {
                    let num = $.fn.dataTable.render
                        .number(".", ",", 2, "", "€")
                        .display(row[3]);
                    return num;
                },
            },
            {
                title: nombreLoteCadena,
                render: function (data, type, row) {
                    return row[9];
                },
            },
            {
                title: importeLoteCadena,
                render: function (data, type, row) {
                    let num = $.fn.dataTable.render
                        .number(".", ",", 2, "", "€")
                        .display(row[10]);
                    return num;
                },
            },
            {
                title: estadoCadena,
                render: function (data, type, row) {
                    return ETIQUETA_ESTADO.get(row[4]);
                },
            },
            {
                title: categoriaCadena,
                render: function (data, type, row) {
                    return ETIQUETA_TIP_CONT.get(row[5]);
                },
            },
            {
                title: adjudicatarioCadena,
                render: function (data, type, row) {
                    return (
                        '<a id="fichaAdjudicatario" aria-label="Abrir ficha" >' +
                        row[6] +
                        "</a>"
                    );
                },
                className: "details-control",
            },
            {
                title: importeAdjCadena,
                render: function (data, type, row) {
                    return numeral(row[11]).format(importeFormato, Math.ceil);
                },
            },
            {
                title: numeroLicitadoresCadena,
                render: function (data, type, row) {
                    return row[7];
                },
            },
        ],
		dom: '<"row panel-footer"<"col-sm-offset-1 col-sm-5"l><"col-sm-5"B>>rt<"row"<"col-sm-offset-1 col-sm-5"fi><"col-sm-5"p>>',
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
                        title: 'org_contratante',
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
                        title: 'org_contratante',
                        className: 'btn btn-primary',
                        exportOptions: {
                            search: 'applied',
                            order: 'applied',
                        },
						action: function (e, dt, button, config) {
							let data = dt.buttons.exportData();

							$.fn.dataTable.fileSave(
								new Blob([JSON.stringify(data)]),
								"contratos.json"
							);
						},
					},
					{
						text: 'PDF <span class="fa fa-file-pdf-o"></span>',
						className: "btn btn-primary",
						extend: "pdfHtml5",
						filename: "org_contratante",
						orientation: "landscape",
						pageSize: "A4",
						exportOptions: {
							search: "applied",
							order: "applied",
						},
						customize: function (doc) {
							doc.content.splice(0, 1);
							let now = new Date();
							let jsDate =
								now.getDate() +
								"-" +
								(now.getMonth() + 1) +
								"-" +
								now.getFullYear();
							let logo = LOGO_BASE_64;
							doc.pageMargins = [20, 60, 20, 30];
							doc.defaultStyle.fontSize = 7;
							doc.styles.tableHeader.fontSize = 7;
							doc["header"] = function () {
								return {
									columns: [
										{
											image: logo,
											width: 96,
										},
										{
											alignment: "center",
											fontSize: "14",
											text: ["Ficha de organización"],
										},
									],
									margin: 20,
								};
							};
							doc["footer"] = function (page, pages) {
								return {
									columns: [
										{
											alignment: "left",
											text: ["Created on: ", { text: jsDate.toString() }],
										},
										{
											alignment: "right",
											text: [
												"page ",
												{ text: page.toString() },
												" of ",
												{ text: pages.toString() },
											],
										},
									],
									margin: 20,
								};
							};
							let objLayout = {};
							objLayout["hLineWidth"] = function (i) {
								return 0.5;
							};
							objLayout["vLineWidth"] = function (i) {
								return 0.5;
							};
							objLayout["hLineColor"] = function (i) {
								return "#aaa";
							};
							objLayout["vLineColor"] = function (i) {
								return "#aaa";
							};
							objLayout["paddingLeft"] = function (i) {
								return 4;
							};
							objLayout["paddingRight"] = function (i) {
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
                        title: 'org_contratante',
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
    $.fn.dataTable.ext.errMode = "none";

    if (!segundaPasada) {
        $("#tablaOrgContr tbody").on("click", "td.details-control", function () {
            let td = $(this).closest("td").html();
            let tr = $(this).closest("tr");
            let row = tablaOrgContr.row(tr);

            let url;
            if (td.includes("fichaContrato")) {
                url = "fichaContrato.html?lang=" + $.i18n().locale;
                url =
                    url +
                    "&id=" +
                    row.data()[0] +
                    "&capaAnterior=fichaOrganizacionContratante";

                $("#iframeFichaContrato", window.parent.document).attr("src", url);
                $("#iframeFichaContrato", window.parent.document).height(
                    $(document).height()
                );

                $("#capaBuscador", window.parent.document).hide();
                $("#capaAyuda", window.parent.document).hide();
                $("#capaFichaContrato", window.parent.document).show();
                $("#capaFichaAdjudicatario", window.parent.document).hide();
                $("#capaFichaOrganizacionContratante", window.parent.document).hide();
            } else if (td.includes("fichaAdjudicatario")) {
                url = "fichaAdjudicatario.html?lang=" + $.i18n().locale;
                url =
                    url +
                    "&id=" +
                    row.data()[8] +
                    "&capaAnterior=fichaOrganizacionContratante";

                $("#iframeFichaAdjudicatario", window.parent.document).attr("src", url);
                $("#iframeFichaAdjudicatario", window.parent.document).height(
                    $(document).height()
                );

                $("#capaBuscador", window.parent.document).hide();
                $("#capaAyuda", window.parent.document).hide();
                $("#capaFichaContrato", window.parent.document).hide();
                $("#capaFichaAdjudicatario", window.parent.document).show();
                $("#capaFichaOrganizacionContratante", window.parent.document).hide();
            }
        });
    }
}

/*
                Función que permite ocultar la ficha
*/
function volverBusqueda() {
    if (LOG_DEGUB_FICHA_ORG_CONTRATANTE) {
        console.log("volverBusqueda");
    }

    if (paramCapaAnterior == "buscador") {
        $("#capaBuscador", window.parent.document).show();
        $("#capaAyuda", window.parent.document).hide();
        $("#capaFichaContrato", window.parent.document).hide();
        $("#capaFichaAdjudicatario", window.parent.document).hide();
        $("#capaFichaOrganizacionContratante", window.parent.document).hide();
    }
    if (paramCapaAnterior == "inicio") {
        $("#capaBuscador", window.parent.document).show();
        $("#capaAyuda", window.parent.document).hide();
        $("#capaFichaContrato", window.parent.document).hide();
        $("#capaFichaAdjudicatario", window.parent.document).hide();
        $("#capaFichaOrganizacionContratante", window.parent.document).hide();
    }
    if (paramCapaAnterior == "fichaAdjudicatario") {
        $("#capaBuscador", window.parent.document).hide();
        $("#capaAyuda", window.parent.document).hide();
        $("#capaFichaContrato", window.parent.document).hide();
        $("#capaFichaAdjudicatario", window.parent.document).show();
        $("#capaFichaOrganizacionContratante", window.parent.document).hide();
    }
    if (paramCapaAnterior == "fichaContrato") {
        $("#capaBuscador", window.parent.document).hide();
        $("#capaAyuda", window.parent.document).hide();
        $("#capaFichaContrato", window.parent.document).show();
        $("#capaFichaAdjudicatario", window.parent.document).hide();
        $("#capaFichaOrganizacionContratante", window.parent.document).hide();
    }
    if (paramCapaAnterior == "fichaOrganizacionContratante") {
        $("#capaBuscador", window.parent.document).hide();
        $("#capaAyuda", window.parent.document).hide();
        $("#capaFichaContrato", window.parent.document).hide();
        $("#capaFichaAdjudicatario", window.parent.document).hide();
        $("#capaFichaOrganizacionContratante", window.parent.document).show();
    }
}
