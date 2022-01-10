/*
Copyright 2018 Ayuntamiento de A Coruña, Ayuntamiento de Madrid, Ayuntamiento de Santiago de Compostela, Ayuntamiento de Zaragoza, Entidad Pública Empresarial Red.es

Licensed under the EUPL, Version 1.2 or – as soon they will be approved by the European Commission - subsequent versions of the EUPL (the "Licence");
You may not use this work except in compliance with the Licence.
You may obtain a copy of the Licence at:

https://joinup.ec.europa.eu/software/page/eupl

Unless required by applicable law or agreed to in writing, software distributed under the Licence is distributed on an "AS IS" basis,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the Licence for the specific language governing permissions and limitations under the Licence.
*/

/*
Algunas variables que se usan en este javascript se inicializan en ciudadesAbiertas.js
*/

// Estructura para saber cuando han acabado las peticiones ajax iniciales
var peticionesIniciales = [false, false, false, false, false, false];

// Variables para almacenar los parámetros de la URL
var paramId;
var paramCapaAnterior;

// Variables para almacenar la información de contratos
var processCol = [];
var processTender = [];
var processOrgCol = [];
var organizationCol = {};
var tenderCol = [];
var tenderSupplier = [];
var lotCol = [];
var lotSupplier = [];
var awardCol = [];
var tenderAnyoCol = [];
var anyoCol = [];
var numContratosCol = [];
var numContratosGrafCol = [];
var numContratosTotal = 0;
var importeContratosCol = [];
var importeContratosTotal = 0;
var importeContratosGrafCol = [];
var awardAnyoCol = [];
var processBuyer = [];
var buyerCol = [];
var awardSupplierFor = new Map();
var orgContratanteMap = new Map();
var orgContratanteCol = [];
var procedimientoMap = new Map();
var procedimientoCol = [];

// Variable para almacenar el contenido de la tabla
var dataSet = [];

/*
                Función de inicialización del script
*/
function inicializaFichaAdjudicatario() {
    if (LOG_DEGUB_FICHA_ADJUDICATARIO) {
        console.log("inicializaFichaAdjudicatario");
    }
    inicializaMultidiomaFichaAdjudicatario();
}

/* 
                Función para inicializar el multidioma
*/
function inicializaMultidiomaFichaAdjudicatario() {
    if (LOG_DEGUB_FICHA_ADJUDICATARIO) {
        console.log("inicializaMultidiomaFichaAdjudicatario");
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
                inicializaDatosFichaAdjudicatario();
                preparaTablaFichaOrgCont();
            });
    });

    $.i18n.debug = LOG_DEGUB_FICHA_ADJUDICATARIO;
}

/*
                Función que invoca a todas las funciones que se realizan al inicializar el script
*/
function inicializaDatosFichaAdjudicatario() {
    if (LOG_DEGUB_FICHA_ADJUDICATARIO) {
        console.log("inicializaDatosFichaAdjudicatario");
    }
    capturaParam();
    inicializaDatos();
    $("#buscarListado").click(function () {
        buscar();
        this.blur();
    });
}

/*
                Función que comprueba y captura si se han pasado parámetros a la web, en caso de haberlos ejecutará una búsqueda con ellos.
*/
function capturaParam() {
    if (LOG_DEGUB_FICHA_ADJUDICATARIO) {
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
    if (LOG_DEGUB_FICHA_ADJUDICATARIO) {
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
    let table = $("#tablaAdjudicatario").DataTable();
    table.clear();
    table.rows.add(dataSet).draw();
}

/*
                Función que iniciliza los datos que dependen de la API
*/
function inicializaDatos() {
    if (LOG_DEGUB_FICHA_ADJUDICATARIO) {
        console.log("inicializaDatos");
    }

    if (paramId) {
        obtieneDatosAPIProcess(dameURL(PROCESS_URL_1 + PROCESS_URL_2));
        obtieneDatosAPIOrganization(
            dameURL(ORGANIZATION_URL_1 + ORGANIZATION_URL_2)
        );
        obtieneDatosAPITender(dameURL(TENDER_URL_1 + TENDER_URL_2));
        obtieneDatosAPILot(dameURL(LOT_URL_1 + LOT_URL_2));
        obtieneDatosAPIStatus(
            dameURL(TENDER_DISTINCT_URL_1 + TENDER_DISTINCT_URL_2 + STATUS)
        );
        obtieneDatosAPIAward(
            dameURL(AWARD_ORGANIZATION_URL1 + paramId + AWARD_ORGANIZATION_URL2)
        );
    }
}

/*
                Función que iniciliza los datos que dependen de la API
*/
function obtieneDatosAPIProcess(url) {
    if (LOG_DEGUB_FICHA_ADJUDICATARIO) {
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
                    if (process.hasTender) {
                        processTender[process.hasTender] = process;
                    }

                    if (buyerCol.indexOf(process.isBuyerFor) == -1) {
                        buyerCol.push(process.isBuyerFor);
                    }
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
            let err = textStatus + ", " + error;
            console.error("Request Failed: " + err);
        });
}

/*
                Función que iniciliza los datos que dependen de la API
*/
function obtieneDatosAPIOrganization(url) {
    if (LOG_DEGUB_FICHA_ADJUDICATARIO) {
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
                    if (organization.id == paramId) {
                        $("#titulo").html(data.records[i].title);
                        //cifadjudicatario
                        $("#cifadjudicatario").html(data.records[i].id);
                    }
                    organizationCol[organization.id] = organization;
                }
                if (data.next) {
                    obtieneDatosAPIOrganization(dameURL(data.next));
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
    if (LOG_DEGUB_FICHA_ADJUDICATARIO) {
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
                    };
                    if (tender.periodStartDate) {
                        tender.anyo = Date.parse(tender.periodStartDate).toString("yyyy");
                    } else if (tender.periodEndDate) {
                        tender.anyo = Date.parse(tender.periodEndDate).toString("yyyy");
                    } else {
                        tender.anyo = "";
                    }
                    tenderCol[tender.id] = tender;
                    tenderSupplier[tender.hasSupplier] = tender;
                }
                if (data.next) {
                    obtieneDatosAPITender(dameURL(data.next));
                } else {
                    modificaPeticionesInicialesr(2);
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

                    lotAux = [];
                    if (lotSupplier[lot.hasSupplier]) {
                        lotAux = lotSupplier[lot.hasSupplier];
                    }
                    lotAux.push(lot);
                    lotSupplier[lot.hasSupplier] = lotAux;
                    lotSupplier[lot.hasSupplier] = lotAux;
                }
                if (data.next) {
                    obtieneDatosAPILot(dameURL(data.next));
                } else {
                    modificaPeticionesInicialesr(5);
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
    if (LOG_DEGUB_FICHA_ADJUDICATARIO) {
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
                    if (award.awardDate) {
                        award.anyo = Date.parse(award.awardDate).toString("yyyy");
                    }
                    awardCol.push(award);

                    let awardAnyoColAux = [];
                    if (awardAnyoCol[award.anyo + ""]) {
                        awardAnyoColAux = awardAnyoCol[award.anyo];
                    }
                    awardAnyoColAux.push(award);
                    awardAnyoCol[award.anyo + ""] = awardAnyoColAux;

                    if (!anyoCol.includes(award.anyo)) {
                        anyoCol.push(award.anyo + "");
                    }

                    let awardSupplierForAux = [];
                    if (awardSupplierFor.get(award.isSupplierFor)) {
                        awardSupplierForAux = awardSupplierFor.get(award.isSupplierFor);
                    }
                    awardSupplierForAux.push(award);
                    awardSupplierFor.set(award.isSupplierFor, awardSupplierForAux);
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
            let err = textStatus + ", " + error;
            console.error("Request Failed: " + err);
        });
}

/*
                Función que iniciliza los datos que dependen de la API
*/
function obtieneDatosAPIStatus(url) {
    if (LOG_DEGUB_FICHA_ADJUDICATARIO) {
        console.log("obtieneDatosAPIStatus | " + url);
    }

    $("#selectEstado")
        .empty()
        .append("<option value=''></option>")
        .attr("selected", "selected");
    $.getJSON(dameURL(url))
        .done(function (data) {
            if (data && data.records && data.records.length) {
                let i;
                for (i = 0; i < data.records.length; i++) {
                    $("#selectEstado").append(
                        "<option value='" +
                            data.records[i] +
                            "'>" +
                            data.records[i] +
                            "</option>"
                    );
                }
                if (data.next) {
                    obtieneDatosAPIStatus(dameURL(data.next));
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
Funcion que modifica un attributo del objeto taskmaster del padre (si existe)
*/
function modificaPeticionesInicialesr(attr) {
    if (LOG_DEGUB_FICHA_ADJUDICATARIO) {
        console.log("modificaPeticionesInicialesr | " + attr);
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
    if (LOG_DEGUB_FICHA_ADJUDICATARIO) {
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
    if (!peticionesIniciales[4]) {
        return false;
    }
    if (!peticionesIniciales[5]) {
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
    if (LOG_DEGUB_FICHA_ADJUDICATARIO) {
        console.log("insertaDatosIniciales");
    }

    trataDatosPorAnyo();
    inicializaIndicadores();
    creaDatosGrafico3y4();
    pintaGrafico(numContratosGrafCol);
    pintaGrafico2(importeContratosGrafCol);
    pintaGrafico3(orgContratanteCol);
    pintaGrafico4(procedimientoCol);
    preparaTablaFichaOrgCont(false);
    creaDatasetTabla(paramId, "", "");
    $(".table-responsive").show();
    let table = $("#tablaAdjudicatario").DataTable();
    table.clear();
    table.rows.add(dataSet).draw();
    scrollTop();
    $(".modal").modal("hide");
}

/*
                Función que crea las estructuras para los gráficos
*/
function trataDatosPorAnyo() {
    if (LOG_DEGUB_FICHA_ADJUDICATARIO) {
        console.log("trataDatosPorAnyo");
    }

    let awardAnyoColAux;

    $("#selectAnyo")
        .empty()
        .append("<option value=''></option>")
        .attr("selected", "selected");
    let a;
    for (a = 0; a < anyoCol.length; a++) {
        let numContratos = 0;
        let importeContratos = 0;
        let anyoIndicador = anyoCol[a];
        $("#selectAnyo").append(
            "<option value='" + anyoIndicador + "'>" + anyoIndicador + "</option>"
        );
        awardAnyoColAux = awardAnyoCol[anyoIndicador];
        if (awardAnyoColAux) {
            numContratos = awardAnyoColAux.length;
            let b;
            for (b = 0; b < awardAnyoColAux.length; b++) {
                let award = awardAnyoColAux[b];
                importeContratos = importeContratos + award.valueAmount;
            }
            numContratosCol[anyoIndicador] = numContratos;
            let numContratosGraf = {
                anyoIndicador: anyoIndicador,
                numContratos: numContratos,
            };
            numContratosGrafCol.push(numContratosGraf);
            numContratosTotal = numContratosTotal + numContratos;
            importeContratosCol[anyoIndicador] = importeContratos;
            let importeContratosGraf = {
                anyoIndicador: anyoIndicador,
                importeContratos: importeContratos,
            };
            importeContratosGrafCol.push(importeContratosGraf);
            importeContratosTotal = importeContratosTotal + importeContratos;
        }
    }
}

/*
                Función que inserta los datos de los indocadores en la página web
*/
function inicializaIndicadores() {
    if (LOG_DEGUB_FICHA_ADJUDICATARIO) {
        console.log("inicializaIndicadores");
    }

    $("#numContratos").html(numContratosTotal);
    let importe = numeral(importeContratosTotal).format(
        importeFormato,
        Math.ceil
    );
    $("#impContratos").html(importe);
}

/*
                Función que pinta el gráfico NumContratos
*/
function pintaGrafico(data1) {
    if (LOG_DEGUB_FICHA_ADJUDICATARIO) {
        console.log("pintaGráficoNumContratos");
    }

    am4core.useTheme(am4themes_frozen);
    am4core.useTheme(am4themes_animated);

    let chart = am4core.create("chartdivTree1", am4charts.XYChart);
    chart.data = data1;
    chart.language.locale = am4lang_es_ES;

    chart.focusFilter.stroke = am4core.color("#0f0");
	chart.focusFilter.strokeWidth = 4;

    let categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
    categoryAxis.dataFields.category = "anyoIndicador";
    categoryAxis.renderer.inversed = true;
    categoryAxis.renderer.grid.template.location = 0;
    categoryAxis.renderer.minGridDistance = 1;

    let valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
    valueAxis.min = 0;

    let series = chart.series.push(new am4charts.ColumnSeries());
    series.dataFields.valueY = "numContratos";
    series.dataFields.categoryX = "anyoIndicador";
    series.columns.template.tooltipText = "[bold]{valueY}[/]";
    series.columns.template.fillOpacity = 0.8;

    let columnTemplate = series.columns.template;
    columnTemplate.strokeWidth = 2;
    columnTemplate.strokeOpacity = 1;
}

/*
                Función que pinta el gráfico ImpContratos
*/
function pintaGrafico2(data2) {
    if (LOG_DEGUB_FICHA_ADJUDICATARIO) {
        console.log("pintaGráficoImpContratos");
    }

    am4core.useTheme(am4themes_frozen);
    am4core.useTheme(am4themes_animated);

    let chart = am4core.create("chartdivTree2", am4charts.XYChart);
    chart.data = data2;
    chart.language.locale = am4lang_es_ES;

    chart.focusFilter.stroke = am4core.color("#0f0");
	chart.focusFilter.strokeWidth = 4;

    let categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
    categoryAxis.dataFields.category = "anyoIndicador";
    categoryAxis.renderer.inversed = true;
    categoryAxis.renderer.grid.template.location = 0;
    categoryAxis.renderer.minGridDistance = 1;

    let valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
    valueAxis.min = 0;

    let series = chart.series.push(new am4charts.ColumnSeries());
    series.dataFields.valueY = "importeContratos";
    series.dataFields.categoryX = "anyoIndicador";
    series.columns.template.tooltipText = "[bold]{valueY}€[/]";
    series.columns.template.fillOpacity = 0.8;

    let columnTemplate = series.columns.template;
    columnTemplate.strokeWidth = 2;
    columnTemplate.strokeOpacity = 1;
}

/*
                Crea una estractura que será insertada en la tabla de la página web
*/
function creaDatasetTabla(licitadorBusqueda, anyoBusqueda, estadoBusqueda) {
    if (LOG_DEGUB_FICHA_ADJUDICATARIO) {
        console.log(
            "creaDatasetTabla | " +
                licitadorBusqueda +
                " , " +
                anyoBusqueda +
                " , " +
                estadoBusqueda
        );
    }

    dataSet = [];
    let posResult = 0;

    let resultadoAnyo = true;
    let resultadoEstado = true;
    let restuadolicitador = true;
    let l;
    for (l = 0; l < awardCol.length; l++) {
        let id = "";
        let identifier = "";
        let nombre = "";
        let nombreCompl = "";
        let anyo = "";
        let awardDate = "";
        let categoria = "";
        let estado = "";
        let organismoCId = "";
        let organismoCTitle = "";
        let nlicitadores = "";
        let importePliego = "";
        let licitador = "";
        let importeLote = "";
        let nombreLote = "";
        let importeAdjudicado = "";

        let tenderEncontrado = true;
        let lotEncontrado = true;

        if (anyoBusqueda) {
            resultadoAnyo = false;
        }
        if (estadoBusqueda) {
            resultadoEstado = false;
        }
        if (licitadorBusqueda) {
            restuadolicitador = false;
        }

        if (awardCol[l]) {
            licitador = awardCol[l].isSupplierFor;
            if (licitador && licitador.indexOf(licitadorBusqueda) != -1) {
                restuadolicitador = true;

                anyo = awardCol[l].anyo;
                awardDate = awardCol[l].awardDate;
                if (anyo && anyo == anyoBusqueda) {
                    resultadoAnyo = true;
                }

                importeAdjudicado = awardCol[l].valueAmount;

                let tender = tenderSupplier[awardCol[l].id];
                if (tender) {
                    categoria = tender.mainProcurementCategory;
                    estado = tender.tenderStatus;
                    if (estado == estadoBusqueda) {
                        resultadoEstado = true;
                    }
                    nlicitadores = tender.numberOfTenderers;
                    importePliego = tender.valueAmount;

                    let procress = processTender[tender.id];
                    if (procress) {
                        id = procress.id;
                        identifier = procress.identifier;
                        nombre = procress.title.substring(0,LIMITE_NOMBRE_CONTRATO);
                        nombreCompl = procress.title;
                        organismoCTitle = organizationCol[procress.isBuyerFor].title;
                        organismoCId = organizationCol[procress.isBuyerFor].id;
                    }
                } else {
                    tenderEncontrado = false;
                }

                let lotAux = lotSupplier[awardCol[l].id];
                if (lotAux) {
                    let o;
                    for (o = 0; o < lotAux.length; o++) {
                        let lot = lotAux[o];
                        if (lot) {
                            importeLote = lot.valueAmount;
                            nombreLote = lot.title;

                            let tender = tenderCol[lot.tenderId];
                            if (tender) {
                                categoria = tender.mainProcurementCategory;
                                estado = tender.tenderStatus;
                                if (estado == estadoBusqueda) {
                                    resultadoEstado = true;
                                }
                                nlicitadores = tender.numberOfTenderers;
                                importePliego = tender.valueAmount;

                                let procress = processTender[tender.id];
                                if (procress) {
                                    id = procress.id;
                                    identifier = procress.identifier;
                                    nombre = procress.title.substring(0,LIMITE_NOMBRE_CONTRATO);
                                    nombreCompl = procress.title;
                                    organismoCTitle = organizationCol[procress.isBuyerFor].title;
                                    organismoCId = organizationCol[procress.isBuyerFor].id;
                                }
                            }
                        }
                    }
                } else {
                    lotEncontrado = false;
                }
            }
        }

        if (LOG_DEGUB_FICHA_ADJUDICATARIO) {
            if (!lotEncontrado && !tenderEncontrado) {
                console.log("Tender y Lot no encontrado. Award.id " + awardCol[l].id);
            }
        }

        if (resultadoAnyo && resultadoEstado && restuadolicitador) {
            dataSet[posResult] = [
                id,
                identifier,
                nombre,
                importePliego,
                estado,
                organismoCTitle,
                categoria,
                organismoCId,
                nlicitadores,
                importeLote,
                nombreLote,
                importeAdjudicado,
                awardDate,
                nombreCompl
            ];
            posResult = posResult + 1;
        }
    }
}

/*
                Función que inicializa la tabla de búsqueda
*/
function preparaTablaFichaOrgCont(segundaPasada) {
    if (LOG_DEGUB_FICHA_ADJUDICATARIO) {
        console.log("preparaTablaFichaOrgCont");
    }

    let expedienteCadena = $.i18n("n_expediente");
    let nombreCadena = $.i18n("nombre");
    let categoriaCadena = $.i18n("categoria");
    let organismoContratanteCadena = $.i18n("organismo_contratante");
    let numeroLicitadoresCadena = $.i18n("numero_licitadores");
    let importePliegoCadena = $.i18n("importe-licitacion");
    let importeLoteCadena = $.i18n("importe-lote");
    let IMPORTE_ADJUDICATARIOCadena = $.i18n("importe-adjudicatario");
    let fechaAdjudicatarioCadena = $.i18n("fecha_adjudicatario");
    let nombreLoteCadena = $.i18n("nombre-lote");
    let copyCadena = $.i18n("copiar");
    let modificarTablaCadena = $.i18n("modificar_tabla");
    let descargarCadena = $.i18n("descargar");
    let showHideCadena = $.i18n("Oculta columnas");
    let urlLanguaje = "vendor/datatables/i18n/" + $.i18n().locale + ".json";

    let tablaAdjudicatario = $("#tablaAdjudicatario").DataTable({
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
            { width: "40", targets: 0 },
            { width: "140", targets: 1 },
            { width: "5", targets: 2 },
            { width: "40", targets: 3 },
            { width: "5", targets: 4 },
            { width: "5", targets: 5 },
            { width: "5", targets: 6 },
            { width: "10", targets: 7 },
            { width: "5", targets: 8 },
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
                    return row[10];
                },
            },
            {
                title: importeLoteCadena,
                render: function (data, type, row) {
                    let num = $.fn.dataTable.render
                        .number(".", ",", 2, "", "€")
                        .display(row[11]);
                    return num;
                },
            },
            {
                title: IMPORTE_ADJUDICATARIOCadena,
                render: function (data, type, row) {
                    let num = $.fn.dataTable.render
                        .number(".", ",", 2, "", "€")
                        .display(row[9]);
                    return num;
                },
            },
            {
                title: fechaAdjudicatarioCadena,
                render: function (data, type, row) {
                    return Date.parse(row[12]).toString("dd-MM-yyyy");
                },
            },
            {
                title: categoriaCadena,
                render: function (data, type, row) {
                    return ETIQUETA_TIP_CONT.get(row[6]);
                },
            },
            {
                title: organismoContratanteCadena,
                render: function (data, type, row) {
                    return (
                        '<a id="fichaOrganizacionContratante" aria-label="Abrir ficha" >' +
                        row[5] +
                        "</a>"
                    );
                },
                className: "details-control",
            },
            {
                title: numeroLicitadoresCadena,
                render: function (data, type, row) {
                    return row[8];
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
                        title: 'adjudicatario',
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
                        title: 'adjudicatario',
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
						filename: "adjudicatario",
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
											text: ["Ficha de adjudicatario"],
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
                        title: 'adjudicatario',
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
            $('#iframeFichaAdjudicatario', window.parent.document).height($('body').height());
        },
        drawCallback: function (settings, json) {
            heightConTabla = $('body').height();
            $('#iframeFichaAdjudicatario', window.parent.document).height($('body').height());
        },
    });

	

    //Esta linea es para que no haya warnings en dataTables
    $.fn.dataTable.ext.errMode = "none";

    if (!segundaPasada) {
        $("#tablaAdjudicatario tbody").on(
            "click",
            "td.details-control",
            function () {
                let td = $(this).closest("td").html();
                let tr = $(this).closest("tr");
                let row = tablaAdjudicatario.row(tr);
                let url;
                if (td.includes("fichaContrato")) {
                    url = "fichaContrato.html?lang=" + $.i18n().locale;
                    url =
                        url + "&id=" + row.data()[0] + "&capaAnterior=fichaAdjudicatario";

                    $("#iframeFichaContrato", window.parent.document).attr("src", url);
                    $("#iframeFichaContrato", window.parent.document).height(
                        $(document).height()
                    );

                    $("#capaBuscador", window.parent.document).hide();
                    $("#capaAyuda", window.parent.document).hide();
                    $("#capaFichaContrato", window.parent.document).show();
                    $("#capaFichaAdjudicatario", window.parent.document).hide();
                    $("#capaFichaOrganizacionContratante", window.parent.document).hide();
                } else if (td.includes("fichaOrganizacionContratante")) {
                    url = "fichaOrganizacionContratante.html?lang=" + $.i18n().locale;
                    url =
                        url + "&id=" + row.data()[7] + "&capaAnterior=fichaAdjudicatario";

                    $("#iframeFichaOrganizacionContratante", window.parent.document).attr(
                        "src",
                        url
                    );
                    $(
                        "#iframeFichaOrganizacionContratante",
                        window.parent.document
                    ).height($(document).height());

                    $("#capaBuscador", window.parent.document).hide();
                    $("#capaAyuda", window.parent.document).hide();
                    $("#capaFichaContrato", window.parent.document).hide();
                    $("#capaFichaAdjudicatario", window.parent.document).hide();
                    $("#capaFichaOrganizacionContratante", window.parent.document).show();
                }
            }
        );
    }
}

/*
                Función que permite ocultar la ficha
*/
function volverBusqueda() {
    if (LOG_DEGUB_FICHA_ADJUDICATARIO) {
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

function creaDatosGrafico3y4() {
    if (LOG_DEGUB_FICHA_ADJUDICATARIO) {
        console.log("creaDatosGrafico3y4");
    }

    let awardSupplierForAux = awardSupplierFor.get(paramId);
    let index;
    for (index = 0; index < awardSupplierForAux.length; index++) {
        let idAward = awardSupplierForAux[index];

        let process;
        let tender;
        if (tenderSupplier[idAward.id]) {
            tender = tenderSupplier[idAward.id];
            process = processTender[tender.id];
        }

        let lot;
        if (lotSupplier[idAward.id]) {
            lot = lotSupplier[idAward.id][0];
            process = processTender[lot.tenderId];
            tender = tenderCol[lot.tenderId];
        }

        //Gráfico 3
        let orgContratante;
        if (process) {
            if (orgContratanteMap.get(process.isBuyerFor)) {
                orgContratante = orgContratanteMap.get(process.isBuyerFor);
                orgContratante.numTotal = orgContratante.numTotal + 1;
                let num = numeral(orgContratante.numTotal).format(
                    numFormatoSinDecimales,
                    Math.ceil
                );
                orgContratante.value = num;
            } else {
                orgContratante = {
                    id: process.isBuyerFor,
                    nameCompl: organizationCol[process.isBuyerFor].title,
                    nameCorto: organizationCol[process.isBuyerFor].title.substring(0, 30),
                    numTotal: Number(1),
                };
                let num = numeral(orgContratante.numTotal).format(
                    numFormatoSinDecimales,
                    Math.ceil
                );
                orgContratante.value = num;
            }
            orgContratanteMap.set(process.isBuyerFor, orgContratante);
        }

        //Gráfico 4
        let procedimiento;
        if (tender) {
            if (procedimientoMap.get(tender.procurementMethod)) {
                procedimiento = procedimientoMap.get(tender.procurementMethod);
                procedimiento.numTotal = procedimiento.numTotal + 1;
                let num = numeral(procedimiento.numTotal).format(
                    numFormatoSinDecimales,
                    Math.ceil
                );
                procedimiento.value = num;
            } else {
                procedimiento = {
                    id: tender.procurementMethod,
                    name: ETIQUETA_TIP_PROC.get(tender.procurementMethod),
                    numTotal: Number(1),
                };
                let num = numeral(procedimiento.numTotal).format(
                    numFormatoSinDecimales,
                    Math.ceil
                );
                procedimiento.value = num;
            }
            procedimientoMap.set(tender.procurementMethod, procedimiento);
        }
    }

    orgContratanteMap.forEach(function callbackFn(value) {
        orgContratanteCol.push(value);
    });
    orgContratanteCol.sort(compareNumTotal);

    procedimientoMap.forEach(function callbackFn(value) {
        procedimientoCol.push(value);
    });
    procedimientoCol.sort(compareNumTotal);
}

function compareNumTotal(a, b) {
    if (a.numTotal > b.numTotal) return -1;
    if (b.numTotal > a.numTotal) return 1;

    return 0;
}

/*
                Función que pinta el gráfico
*/
function pintaGrafico3(data) {
    if (LOG_DEGUB_FICHA_ADJUDICATARIO) {
        console.log("pintaGrafico3");
    }

    am4core.useTheme(am4themes_frozen);
    am4core.useTheme(am4themes_animated);

    let chart = am4core.create("chartdivTree3", am4charts.PieChart);
    chart.data = data;
    chart.language.locale = am4lang_es_ES;

    chart.focusFilter.stroke = am4core.color("#0f0");
	chart.focusFilter.strokeWidth = 4;

    let series = chart.series.push(new am4charts.PieSeries());
    series.dataFields.value = "value";
    series.dataFields.category = "nameCorto";

    series.labels.template.disabled = true;
    series.ticks.template.disabled = true;

    chart.legend = new am4charts.Legend();
    chart.legend.position = "right";
    chart.legend.labels.template.maxWidth = 120;
    chart.legend.labels.template.truncate = true;
    chart.legend.itemContainers.template.tooltipText = "{category}";

    series.legendSettings.labelText = "{nameCorto}";
    series.legendSettings.valueText = "{value}";
    series.slices.template.tooltipText = "{nameCorto}: {value}";
    series.slices.template.cursorOverStyle = am4core.MouseCursorStyle.pointer;
}

/*
                Función que pinta el gráfico
*/
function pintaGrafico4(data) {
    if (LOG_DEGUB_FICHA_ADJUDICATARIO) {
        console.log("pintaGrafico4");
    }

    am4core.useTheme(am4themes_frozen);
    am4core.useTheme(am4themes_animated);

    let chart = am4core.create("chartdivTree4", am4charts.PieChart);
    chart.data = data;
    chart.language.locale = am4lang_es_ES;

    chart.focusFilter.stroke = am4core.color("#0f0");
	chart.focusFilter.strokeWidth = 4;
    
    let series = chart.series.push(new am4charts.PieSeries());
    series.dataFields.value = "value";
    series.dataFields.category = "name";

    series.labels.template.disabled = true;
    series.ticks.template.disabled = true;

    chart.legend = new am4charts.Legend();
    chart.legend.position = "right";
    chart.legend.labels.template.maxWidth = 120;
    chart.legend.labels.template.truncate = true;
    chart.legend.itemContainers.template.tooltipText = "{category}";

    series.legendSettings.labelText = "{name}";
    series.legendSettings.valueText = "{value}";
    series.slices.template.tooltipText = "{name}: {value}";
    series.slices.template.cursorOverStyle = am4core.MouseCursorStyle.pointer;
}
