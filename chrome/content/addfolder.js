// This file may be used under the terms of of the
// GNU General Public License Version 2 or later (the "GPL"),
// http://www.gnu.org/licenses/gpl.html
//

S3Ajax.upload = function(bucket, key, file, cb) 
{
	var params = {};
	try 
	{
		params.content_type = mimeSVC.getTypeFromFile(file);
		// TODO: if this fails, we should do our own lookup ... instead of just defaulting to text/plain
	} catch(e) {};
  
	var upload_status = document.getElementById('upload_status');
	var realStart = -1;
	
	params.listener = function(position, total) 
	{
		// HACK: firefox doesn't seem to reset the position to 0
		// between requests, so we take the value of the first callback
		// as approximately 0
		if (realStart < 0) { realStart = position; }
		position = position - realStart;

		upload_status.innerHTML = (Math.floor(1000 * position / total)/10) + "%";
	}
	
	S3Ajax.put(bucket, key, file, params, cb,
    function(req) 
	{
		humanMsg.displayMsg('Upload to <strong>' + bucket + '</strong>: ' +
        req.responseXML.getElementsByTagName('Message')[0].childNodes[0].textContent);
		cb();
    });
}

var Creator = {
	working: false,
	queue: [],
	
	add: function(file) 
	{
		var f_name=folder+".dir"
		var key = escape(prefix + folder + '/' + f_name);
		Creator.queue.push({key: key, file: file});
		$('#queue_size').html(Creator.queue.length + ' remaining in queue.');
		if (!Creator.working) 
		{
			Creator.upload();
		}
	},
  
	upload: function()
	{
		Creator.working = true;
		var cur = Creator.queue.shift();
		var status = '<h3><img src="chrome://s3/skin/spinner.gif" /> Working...</h3>' + '<h6>' + cur.key + ' <span id="upload_status"></span></h6>' + '<p id="queue_size">';
		if (Creator.queue.length > 0) 
		{
			status += Creator.queue.length + ' remaining in queue.'
		}
		status += '</p>'
		$.blockUI(status);
		S3Ajax.upload(bucket, cur.key, cur.file, Creator.uploadComplete);
	},
	uploadComplete: function() 
	{
		if (Creator.queue.length > 0) 
		{
			Creator.upload();
		}
		else 
		{
			Creator.working = false;
			$.unblockUI();
			fm.listKeys();
		}
	}
}
