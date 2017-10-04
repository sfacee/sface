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
						
	 		