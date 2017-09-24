# sface

A chrome Web Extension to sonify facebook

# Installation Web Extension:             

  		upload root folder to chrome://extensions

# Installation Host application:

## dependencies oscpack:
	
			cd ~
			git clone https://github.com/arturoc/oscpack
			cd oscpack 
			make
			sudo make install

## compile:
		
		cd host
		g++ sface.cpp 
	 	or
		cmake .
		make

## install host app:

		sudo ./install_host.sh 			 

## manual execution:

		./sface	   


## sface:

chrome extension that comunicate with a c++ app running in the background, it convert the users input into osc messages.
																							 
																							/
	user-inputs -- > webpage -- >  browser-extension -- > host-app -- > supercollider -- > | )   
		|_____________________________________________________^				  ^				\ 
		|_____________________________________________________________________|				 

		_____________________________________________________________
		|X[]_ ______________________________________________________|
		|  _________________________________________________     _	|
		| |_https://facebook.com/___________________________|   |_|----------> sface extension
		|___________________________________________________________|                            
		|_facebook_X|_ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _|               
		|-----------------------------------------------------------|---> content   
		|    f _____________________|search|                |@|xxx|?|               
		|-----------------------------------------------------------|               
		| news	      |	 _____________________________  | _________ |               
		| messenger   |	|X	XXX	XX	XXXX  X  X	XX    | | _________ |               
		|			  |	|	XX	XX	X	XXXX	XXXX  | | --------- |               
		| events	  |	|__X___XXX_X_XX____XX__XX_____| | _________ |               
		| groups	  |	|<3:)€________________________| | \\\\\\\\\ |               
		| pages 	  |	 _____________________________  | ///////// |               
		| ...		  | \-______-------------____-----\ | |||||||||	|               	
		| ...		  | /-______-------------____-----/ | /////////	|               	

           																	    
           																	    	
## sface pipeline       								

	EXTENSION   manifest.json 
				|
				*->background:
				|  		     |
				|	         * background.html
				|	  	     * background.js<->|
				|		    				   |
				*------>popup: 				   | 
				| 	    	 |                 |
				|	   		 * popup.html      |
				|	   		 * popup.js<------>| native messages
				|							   |
				*---->content: 				   | 
				\		 	 |				   |
				/	 	 	 * core.js-------->|	
				\		 	 * core.css        \
			 	/							   / 
			 	\							   \	 
	HOST  		host_manifest.json	           / stdio
				|					           \
				*->sface.cpp<----------------->/
										   	)
										   	(
	SC 			supercollider 				   ) osc
				|							   (
				*->server<-------------------->)
			   
	


						
						
	 					