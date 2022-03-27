<?php

	// Run a python script in a web page via PHP.
	// You will need to upload your python script to the server... but don't put it in a public directory.

	// This takes variables from the url in the familiar http://www.example.com?name=value&name=value format.
	// Note that we run it through escapeshellarg() to make sure someone doesn't try to inject their own python code.
	$address = escapeshellarg($_GET['address']);
	$count = escapeshellarg($_GET['count']);
	
	// Store output.
	$data = '';	

	// This part loads the script and reads its output.	
	$handle = popen('python /home/eric/homes/geo_haiku.py "' . $address . '" ' . $count, 'r');
	
	// Read the output one chunk at a time, store it in $data.
	while (!feof($handle)) {
		$data .= fread($handle, 4096);
	}
	
	// We're done reading, clean up.
	pclose($handle);
	
	// Return the output of the python script to the browser window.
	print $data;
	
?>