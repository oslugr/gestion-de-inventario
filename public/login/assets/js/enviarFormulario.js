
function iniciarSesion(){

    const json = {
        user: $('#is-username').val(),
        pass: $('#is-password').val()
    }

    $.ajax({
		url: `/api/usuario/login/`,
        data: JSON.stringify(json),
		contentType: "application/json; charset=utf-8",
		dataType: "json",
		type: 'POST',
		success: function(data){
			window.location.replace('/')
		},
		error: function(){
			$('#titulo-error').html('Error al iniciar sesión')
			$('#mensaje-error').html('Usuario o contraseña erróneos')
			$('.popup').removeClass('hidden');

			setTimeout(() => $('.popup').addClass('hidden'), 3000 )
		}
	});

}