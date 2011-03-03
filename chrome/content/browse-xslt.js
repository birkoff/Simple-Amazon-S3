Components.utils.import("resource://s3/auth.js");

var Cc = Components.classes;
var Ci = Components.interfaces;

const mimeSVC = Cc['@mozilla.org/mime;1'].getService(Ci.nsIMIMEService);

var bucket, prefix;
var xslt = new XSLTProcessor();

function deleteKey(node) 
{
	var key = node.getAttribute('key');
	if (confirm('Are you sure you want to delete:\n' + key)) 
	{
		fm.delete( escape(key), node );
	}
}



var fm = {
	init: function() 
	{
		document.title = window.location.href;
		
		$('.upload').click(function() 
		{
			fm.upload();
			return false;
		})
		
		$('.add_folder').click(function() 
		{
			fm.addfolder();
			return false;
		})

		var creds = s3_auth.get();
		if (creds) 
		{
			S3Ajax.KEY_ID = creds.key;
			S3Ajax.SECRET_KEY = creds.secret;
			document.body.removeAttribute("unauth");
		} 
		else 
		{
			// if the keys aren't set proceed without them
			// S3Ajax will do anonymous calls
			document.body.setAttribute("unauth", true);
		}	

		var req = new XMLHttpRequest();
		req.open("GET", "chrome://s3/content/keys.xsl", false);
		req.send(null);

		xslt.importStylesheet(req.responseXML);

		bucket = window.top.location.host;
		
		print_location_base="<a href='s3://'>s3</a>://<a href='s3://" + bucket + "'> " + bucket + "</a> ";
		url_location_base="s3://" + bucket + "/";
		
		prefix = unescape(window.top.location.pathname.slice(1));
		
		folders=prefix.split("/");
		
		url_folders=url_location_base;
		print_folders=print_location_base;
				
		for(var i in folders)
		{
			url_folders +=folders[i]+"/";
			print_folders +="/ <a href='"+url_folders+"'>" + folders[i] + "</a> ";
		}
		$('#location').html(print_folders)
		
		//$('#location').html("<a href='s3://'>s3</a>://<a href='s3://"+bucket+"'>"+bucket+"</a>/"+prefix)
		
		fm.listKeys();
	},

	listKeys: function() 
	{
		$('#active').addClass('busy')
		S3Ajax.listKeys(bucket,{prefix: prefix, delimiter: '/'},function (req) 
		{
			var keylist = $('#keylist')[0];
			if (keylist) 
			{
				keylist.parentNode.removeChild(keylist);
			}
			var fragment = xslt.transformToFragment(req.responseXML, document);
			$('#active')[0].appendChild(fragment);
			$('#active').removeClass('busy');
		},	function(req) 
		{
			$('#active').removeClass('busy');
			humanMsg.displayMsg('Listing in <strong>' + bucket + '</strong>: ' +
			req.responseXML.getElementsByTagName('Message')[0].childNodes[0].textContent)
		}
		);
	},

	delete: function(key, element) 
	{
		S3Ajax.deleteKey( bucket, key, function() 
		{
			$(element).remove();
		}, function(req) {
			humanMsg.displayMsg('Deletion in <strong>' + bucket + '</strong>: ' +
			req.responseXML.getElementsByTagName('Message')[0].childNodes[0].textContent)
		});
	},

	upload: function() 
	{
		var picker = Cc["@mozilla.org/filepicker;1"].createInstance(Ci.nsIFilePicker);
		picker.init(window, 'Choose file(s) to upload to S3', Ci.nsIFilePicker.modeOpenMultiple);
		if (picker.show() == Ci.nsIFilePicker.returnOK) 
		{
			var enum = picker.files;
			while (enum.hasMoreElements()) 
			{
				var file = enum.getNext();
				file.QueryInterface(Ci.nsIFile); //provides runtime type discovery. 
				Uploader.add(file);
			}
		}
	},
	addfolder: function() 
	{
		try
		{
			data="folder file";
			folder = prompt("Folder Name: ","");
			var flag=folder;
			if(flag!=null && flag != "")
			{
				var file = Cc["@mozilla.org/file/directory_service;1"].getService(Ci.nsIProperties).get("TmpD", Ci.nsIFile);
				file.append(folder+".dir");
				file.createUnique(Ci.nsIFile.NORMAL_FILE_TYPE, 0777); // here we create the file
				
				// file is nsIFile, data is a string
				var foStream = Components.classes["@mozilla.org/network/file-output-stream;1"].createInstance(Components.interfaces.nsIFileOutputStream);

				// use 0x02 | 0x10 to open file for appending.
				foStream.init(file, 0x02 | 0x08 | 0x20, 0666, 0); 
				// write, create, truncate
				// In a c file operation, we have no need to set file mode with or operation,
				// directly using "r" or "w" usually.

				// if you are sure there will never ever be any non-ascii text in data you can 
				// also call foStream.writeData directly
				var converter = Components.classes["@mozilla.org/intl/converter-output-stream;1"].createInstance(Components.interfaces.nsIConverterOutputStream);
				converter.init(foStream, "UTF-8", 0, 0);
				converter.writeString(data);
				converter.close(); // this closes foStream
				
				Creator.add(file);
			}
		} 
		catch (ex) 
		{ 
			alert(ex); 
		}
	}
}

$(fm.init);
