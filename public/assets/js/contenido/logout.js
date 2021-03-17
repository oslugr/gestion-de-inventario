function logout(){

    $.ajax({
		url: `/api/usuario/logout/`,
		type: 'POST',
		success: function(data){
			window.location.replace('/login')
		}
	});

}