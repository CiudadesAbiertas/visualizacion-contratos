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

// variables para normalizar datos
var numFormatoSinDecimales = '0,0';
var numFormato = '0,0.[00]';
var importeFormato = '0,0.[00]';
var importeFormatoSinDecimales = '0,0';
var anyos = [];


/* 
Métodos para el arranque de la web
*/
function initComun() {
    if (LOG_DEGUB_COMUN) {
        console.log('initComun');
    }

    inicializaDatosInicio();
    multidiomaComun();
    numeralInit();
    
}

/* 
Función para el multiidioma 
*/
function multidiomaComun() {
    if (LOG_DEGUB_COMUN) {
        console.log('multidiomaComun');
    }

    jQuery(function ($) {
        //carga de los idiomas
        $.i18n()
            .load({
                es: 'dist/i18n/es.json',
                en: 'dist/i18n/en.json',
                gl: 'dist/i18n/gl.json',
            })
            .done(function () {
                $('html').i18n();
            });

        //configuración del botón que cambia de idioma
        $('.switch-locale').click(function () {
            let r = confirm(
                'Si se cambia de idioma se perderán las posibles busquedas realizadas'
            );
            if (r) {
                $('#capaBuscador').show();
                $('#capaFichaContrato').show();
                $('#capaFichaAdjudicatario').show();
                $('#capaFichaOrganizacionContratante').show();
                $('#capaAyuda').show();
                $.i18n().locale = $(this).data('locale');
                $('html').i18n();
                document.documentElement.lang = $.i18n().locale;


                $('#tablaContratos').dataTable().fnDestroy();
                $('#tablaAdjudicatarios').dataTable().fnDestroy();

                preparaTablaBuscadorCont();
                preparaTablaBuscadorAdj();        

                $('#tablaContratos').dataTable().fnUpdate();
                $('#tablaAdjudicatarios').dataTable().fnUpdate();
                
                $('#tablaContratos').DataTable().rows.add(dataSet).draw();
                $('#tablaAdjudicatarios').DataTable().rows.add(datasetAdj).draw();
                
                cambioCapaBuscador();
            }
        });
    });

    // Enable debug
    $.i18n.debug = LOG_DEGUB_COMUN;
}

/*
Función que iniciliza los datos que dependen de la API
*/
function inicializaDatosInicio() {
    if (LOG_DEGUB_COMUN) {
        console.log('inicializaDatosInicio');
    }
    if (SEGURIDAD) {
        generarToken();
    }
}

/*
Se inicializa la librería para tratar los formatos de los números
*/
function numeralInit() {
    if (LOG_DEGUB_COMUN) {
        console.log('numeralInit');
    }

    numeral.register('locale', 'es', {
        delimiters: {
            thousands: '.',
            decimal: ',',
        },
        abbreviations: {
            thousand: 'k',
            million: 'm',
            billion: 'b',
            trillion: 't',
        },
        ordinal: function (number) {
            return number === 1 ? 'er' : 'o';
        },
        currency: {
            symbol: '€',
        },
    });
    numeral.locale('es');
}

/* 
Función que permite cambiar a la capa de buscador 
*/
function cambioCapaBuscador() {
    if (LOG_DEGUB_COMUN) {
        console.log('cambioCapaBuscador');
    }

    $('#capaBuscador').show();
    $('#capaFichaContrato').hide();
    $('#capaFichaAdjudicatario').hide();
    $('#capaFichaOrganizacionContratante').hide();
    $('#capaAyuda').hide();

    $('#buttonBuscador').css('font-weight', 'bold');
    $('#buttonGlosario').css('font-weight', 'normal');
}

/* 
Función que permite cambiar a la capa de buscador 
*/
function cambioCapaBuscadorIframe() {
    if (LOG_DEGUB_COMUN) {
        console.log('cambioCapaBuscador');
    }

    $('#capaBuscador', window.parent.document).show();
    $('#capaFichaContrato', window.parent.document).hide();
    $('#capaFichaAdjudicatario', window.parent.document).hide();
    $('#capaFichaOrganizacionContratante', window.parent.document).hide();
    $('#capaAyuda', window.parent.document).hide();

    $('#buttonBuscador', window.parent.document).css('font-weight', 'bold');
    $('#buttonGlosario', window.parent.document).css('font-weight', 'normal');
}

/* 
Función que permite cambiar a la capa de ayuda 
*/
function cambioCapaAyuda() {
    if (LOG_DEGUB_COMUN) {
        console.log('cambioCapaAyuda');
    }

    $('#capaBuscador').hide();
    $('#capaFichaContrato').hide();
    $('#capaFichaAdjudicatario').hide();
    $('#capaFichaOrganizacionContratante').hide();
    $('#capaAyuda').show();

    $('#buttonBuscador').css('font-weight', 'normal');
    $('#buttonGlosario').css('font-weight', 'bold');
}

/*
Función usa la SEGURIDAD de la API en caso de ser necesario
*/
function dameURL(URL) {
    if (LOG_DEGUB_COMUN) {
        console.log('dameURL: ' + URL);
    }

    let resultado;
    resultado = encodeURI(URL);

    if (SEGURIDAD) {
        let fechaActual = new Date();
        let fechaExpiracion = sessionStorage.getItem('fechaExpiracion');
        if (fechaExpiracion || fechaExpiracion == 'Invalid Date') {
            fechaExpiracion = new Date();
        }

        if (fechaActual >= fechaExpiracion) {
            generarToken();
        }

        $.ajaxSetup({
            beforeSend: function (xhr) {
                let authorization = sessionStorage.getItem('authorization');
                xhr.setRequestHeader('Accept', 'application/json');
                xhr.setRequestHeader('Authorization', authorization);
            },
        });
    }

    return resultado;
}

/*
Función que genera el token para realizar la autenticación con la API
*/
function generarToken() {
    if (LOG_DEGUB_COMUN) {
        console.log('generarToken');
    }
    let urlT =
        TOKEN_URL +
        '?username=' +
        USER +
        '&password=' +
        PASS +
        '&grant_type=password';
    let basicA = 'Basic ' + btoa(APP_NAME + ':' + APP_SECRET);

    $.ajax({
        type: 'POST',
        url: urlT,
        contentType: 'application/json; charset=utf-8',
        async: false,
        timeout: VAL_TIME_OUT,

        headers: {
            Accept: 'application/json',
            Authorization: basicA,
        },

        success: function (data) {
            let fechaExpiracion = new Date().getTime();
            let timeSeconds = Number(data.expires_in) - 1;
            fechaExpiracion = new Date(fechaExpiracion + timeSeconds * 1000);
            sessionStorage.setItem('fechaExpiracion', fechaExpiracion);

            let authorization = 'Bearer ' + data.access_token;
            sessionStorage.setItem('authorization', authorization);
        },

        error: function (xhr, textStatus, errorThrown) {
            console.error(xhr.status);
            console.error(xhr.responseText);
            console.error(errorThrown);
            console.error(textStatus);
        },
    });
}

/*
Funcion para obtener parametros de la URL
*/
function getUrlVars() {
    if (LOG_DEGUB_COMUN) {
        console.log('getUrlVars');
    }

    let vars = {};
    let parts = window.location.href.replace(
        /[?&]+([^=&]+)=([^&]*)/gi,
        function (m, key, value) {
            vars[key] = value;
        }
    );
    return vars;
}

/*
Función para llevar la página arriba del todo
*/
function scrollTop() {
    if (LOG_DEGUB_COMUN) {
        console.log('scrollTop');
    }

    window.scrollTo(0, 0);
}
