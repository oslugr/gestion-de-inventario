function logout(){

    $.ajax({
		url: `/api/logout/`,
		type: 'POST',
		success: function(data){
			window.location.replace('/login')
		}
	});

}