		function change(){
			var h1 = document.getElementsByTagName("h1")[0].innerHTML;
			if(h1 == "Log in"){
				document.getElementsByTagName("h1")[0].innerHTML = "Inregistrare";
				document.getElementById("password2").style.display = "inline";
				document.getElementsByTagName("button")[0].innerHTML = "Inregistreaza";
				document.getElementsByTagName("button")[0].onclick = Register;
				document.getElementById("change").innerHTML = "Esti deja inregistrat?";
			}else{
				document.getElementsByTagName("h1")[0].innerHTML = "Log in";
				document.getElementById("password2").style.display = "none";
				document.getElementsByTagName("button")[0].innerHTML = "Login";
				document.getElementsByTagName("button")[0].onclick = Login;
				document.getElementById("change").innerHTML = "Nu ai cont?";
			}
		}
		
		function Response(text){
			var response = document.getElementById("response");
			response.innerHTML = text;
			var t = setTimeout(function (){ response.innerHTML = ""; }, 3000);
			response.addEventListener("click",function (){
				clearTimeout(t);
			});
		}
		
		function Register(){
			var name = document.getElementById("name").value;
			var password = document.getElementById("password").value;
			var password2 = document.getElementById("password2").value;
			var xhttp = new XMLHttpRequest();
			xhttp.open("POST", "/sign_up", true);
			xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
			xhttp.send(`name=${name}&password=${password}&password2=${password2}`);
			xhttp.onreadystatechange = function() {
				if(this.readyState == 4 && this.status == 200) {
					Response(this.responseText);
				}
			}
		}

		function Login(){
			var name = document.getElementById("name").value;
			var password = document.getElementById("password").value;
			var xhttp = new XMLHttpRequest();
			xhttp.open("POST", "/log_in", true);
			xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
			xhttp.send(`name=${name}&password=${password}`);
			xhttp.onreadystatechange = function() {
				if(this.readyState == 4 && this.status == 200) {
					if(this.responseText == "corect")
						window.location.href = '/';
					else
						Response(this.responseText);
				}
			}
		}
		window.addEventListener("keypress",function(ev){
			if(ev.keyCode === 13 || ev.keyCode === 69){
				document.getElementsByTagName("button")[0].click();
			}
		});