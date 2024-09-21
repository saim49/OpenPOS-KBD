var     g_invoiceNum;
var     g_serverUniqueString;
var     g_sessionID = '';
var     g_lineNet;
var     g_invoiceTotal;
var		g_newBillLine = [];
var 	g_uniqueCode = "";
var 	g_editErrorFlag = 0;
var		g_loader = `<div class="spinner-border text-light font-size-sm" role="status"><span class="visually-hidden">Loading...</span></div>`; 	
var		g_logo_dark = `<img src="icons/saimtech-white.png" width="600px">`; 	
var		g_logo_light = `<img src="icons/saimtech-black.png" width="600px">`; 	
var     g_itemNameList = [];
var     g_itemIdCounter = 0;
var 	endpoint = "https://logisticasaan365.com/poslite/api/";
var     g_itemArray = [];






//Author: Muhammad Saim
//Method: get item list from server.
function getItemList()
{
	$('#item-sync-btn').html(g_loader+" Synchronizing...");
	$('#item-sync-table').show();
	var mydata={ key : localStorage.getItem("cloudKey")};
	
	$.ajax({
	    url: endpoint+'get_items',
		type: "POST",
		data: mydata,  
		success: 
			function(data)
			{ 
				var dataAfter = JSON.parse(data);
				localStorage.setItem('itemData', JSON.stringify(dataAfter.items));
				$('#item-sync-btn').html(" Synchronization");
				drawItemTable();
			}
	}); 	

	if (localStorage.getItem('itemNameList'))
	{
		g_itemArray = localStorage.getItem('itemData');
	}
}

//Author: Muhammad Saim
//Method: set item data into select.
function drawItemTable()
{
    g_itemDataLocalStorage = JSON.parse(localStorage.getItem('itemData'));
	var v_counter = 0;
	v_html = "";
    $.each(g_itemDataLocalStorage, function(i, rows) {
		v_counter = Number(v_counter)+1;
		v_html 	+= '<tr>';
		v_html 	+= '<td><center>'+v_counter+'</center></td>';
		v_html 	+= '<td><center>'+rows.name+'</center></td>';
		v_html 	+= '<td><center>'+rows.price+'/-</center></td>';
		v_html 	+= '<td><center>'+rows.disc+'%</center></td>';
		v_html 	+= '</tr>';
	});
	$('#item-lines-model').html(v_html);
}


function calActualDiscountAmount(_price,_qty,_discValue,_flag)
{
    var v_actualDiscountAmount = 0;
    
    if ( _price && _discValue && _flag=='PER')
    {
        v_actualDiscountAmount = (((parseInt(_price) * parseInt(_qty))* parseInt(_discValue))/100);
        v_actualDiscountAmount = Number(v_actualDiscountAmount);       
    }
    else 
    {
        v_actualDiscountAmount = _discValue;
    }
    
    return v_actualDiscountAmount;
}

function getLocalStorageSize() {
    let totalSize = 0;

    for (let i = 0; i < localStorage.length; i++) {
        let key = localStorage.key(i);
        let value = localStorage.getItem(key);

        // Calculate size in bytes for both key and value
        totalSize += key.length + value.length;
    }

    return totalSize;
}



function triggerSaveLineBtn()
{
    if (window.event && window.event.keyCode == 13) 
    {
        window.event.preventDefault();
        document.getElementById('saveLineBtn').click();
        document.getElementById('itemName').focus();
    }
}


function updateBillLine(_itemCode)
{
	for (let i = 0; i < g_newBillLine.length; i++) 
	{
		v_updated = 0;
		if (g_newBillLine[i].itemId === _itemCode) 
		{
			g_newBillLine[i].qty 		= Number($( "#qty-"+_itemCode ).val());
			g_newBillLine[i].net 		= Number($( "#net-"+_itemCode ).text());
			g_newBillLine[i].disc		= Number($( "#disc-"+_itemCode ).val());
			g_newBillLine[i].price		= Number($( "#price-"+_itemCode ).val());
			g_newBillLine[i].discPer	= Number($( "#disc-percentage-"+_itemCode ).val());
			v_updated 					= 1;
		}
	}
	simpleDrawBillLineTable();
	updateTotalBlock();
}

//Author: Muhammad Saim
//Method: Reset bill line feilds
function resetLineFields()
{
    $( "#itemName").val("");
    $( "#price").val("");
	$('#price').prop('readonly', false);
    $( "#qty").val("");
    $( "#disc").val("");
    $( "#net").val("");
    $( "#li-customer-data").val("");
    $( "#itemName").focus();
    $( "#disc-percentage").val("No");
}

//Author: Muhammad Saim
//Method: update right total block
function updateTotalBlock()
{
	$('#li-total-amount').html(sumByKey('net') + sumByKey('disc'));
	$('#li-discount-amount').html(sumByKey('disc'));
	$('#li-net-amount').html(sumByKey('net'));
}

//Author: Muhammad Saim
//Method: save Bill Line
function sumByKey(_key) 
{
		let v_sum = 0;
		for (let i = 0; i < g_newBillLine.length; i++) 
		{
		  if (_key == 'net')
		  {
			v_sum =  v_sum + Number(g_newBillLine[i].net);
		  }
		  else if (_key == 'qty')
		  {
			v_sum =  v_sum + Number(g_newBillLine[i].qty);
		  }
		  else if (_key == 'disc')
		  {
			v_sum =  v_sum + Number(g_newBillLine[i].disc);
		  }
		  
		}
		return v_sum;
}

//Author: Muhammad Saim
//Method: popup
function popup(_title, _msg)
{
	Swal.fire({
		title: _title,
		text: _msg,
		confirmButtonColor: "#198753",
	});
}

//Author: Muhammad Saim
//Method: getUniqueCode
function getUniqueCode()
{
	
	const date = new Date();
	var v_uniqueCode;
	var v_date	= date.getDate();
	var v_month	= Number(date.getMonth())+1;
	var v_year	= date.getFullYear();
	v_uniqueCode = "99"+"-"+v_month+""+v_date+""+v_year;
	g_uniqueCode = v_uniqueCode+"-"+getTodayCounter();
	$('#invoice-number').text(g_uniqueCode);
}

//Author: Muhammad Saim
//Method: getTodayCounter
function getTodayCounter()
{
	
	const d = new Date();
	var v_todayDate  = (Number(d.getMonth())+1)+""+d.getDate()+""+d.getFullYear();
	var v_storeCounter = 0;
	var v_newCounter = 0;

	if (localStorage.getItem('counterDate'))
	{
		var v_storeDate = localStorage.getItem('counterDate');

		if (localStorage.getItem('counterData'))
		{
			if ( v_todayDate == v_storeDate)
			{
				v_storeCounter = Number(localStorage.getItem('counterData')) + 1;
				localStorage.setItem('counterData', v_storeCounter);
				v_newCounter = v_storeCounter;
			}
			else 
			{
				localStorage.setItem('counterData', '1');
				localStorage.setItem('counterDate', v_todayDate);
				v_newCounter = 1;
				
			}
		}
		else
		{
			localStorage.setItem('counterData', '1');
			localStorage.setItem('counterDate', v_todayDate);
			v_newCounter = 1;
		}
	}
	else
	{
		localStorage.setItem('counterData', '1');
		localStorage.setItem('counterDate', v_todayDate);
		v_newCounter = 1;
	}

	return v_newCounter;
}

//Author: Muhammad Saim
//Method: draw Local Storage Bills
function drawLocalStorageBillsTable()
{
	var v_counter = 0;
	var v_previousBillData;
	var v_html = "";
	if (localStorage.getItem("invoicesData"))
	{
		v_previousBillData = JSON.parse(localStorage.getItem("invoicesData"));
		
	}
}
///=============================
///-------Simple Bill-----------
///=============================

//Author: Muhammad Saim
//Method: simple calculate line net
function simpleBillLineNet()
{
    var v_discPercentage;
	var v_net; 
	var v_actualDiscountAmount;
	
	v_discPercentage = $( "#disc-percentage").val();
	
	if (v_discPercentage && v_discPercentage=="Yes")
	{
	    v_actualDiscountAmount =  calActualDiscountAmount($( "#price" ).val(),$( "#qty" ).val(), $( "#disc" ).val() , "PER");
	    v_net = ((($( "#price" ).val()) * ($( "#qty" ).val())) - (v_actualDiscountAmount));
	}
	else
	{
	    v_net = ((($( "#price" ).val()) * ($( "#qty" ).val())) - ($( "#disc" ).val()));
	}
	
	$( "#net" ).val(v_net);
}

//Author: Muhammad Saim
//Method: simple save bill line 
function simpleSaveBillLine()
{
    simpleBillLineNet();
    
    var loc_newBillLineObj 	= {};
	var v_updated 			= 0;
	var v_disc				= $("#disc").val();
	var v_itemName			= $("#itemName").val();
	var v_price				= $("#price").val();
	var v_qty				= $("#qty").val(); 
	var v_net				= $("#net").val();
	var v_disc_per          = "";
	g_itemIdCounter         = g_itemIdCounter + 1
	var v_itemId            = g_itemIdCounter;
	if (v_itemId && v_price &&  v_qty && v_net)
  	{
		if (!v_disc){v_disc = "0";}
		if (!v_qty){v_qty = "0";}
		if (!v_price){v_price = "0";}
		if (!v_net){v_net = "0";}
		
		//-------
		if ($( "#disc-percentage").val() == "Yes")
		{
		    v_disc_per =  ((calActualDiscountAmount(parseFloat(v_price), parseInt(v_qty), parseFloat(v_disc), "PER")) / (parseFloat(v_price) * parseInt(v_qty))*100);
		    v_disc = calActualDiscountAmount(parseFloat(v_price), parseInt(v_qty), parseFloat(v_disc), "PER");
		}
		else
		{
		    v_disc_per = ((parseFloat(v_disc) / (parseFloat(v_price) * parseInt(v_qty)))*100);
		}
		
		loc_newBillLineObj['itemId'] 	= v_itemId;
		loc_newBillLineObj['itemName'] 	= v_itemName;
		loc_newBillLineObj['price'] 	= v_price
		loc_newBillLineObj['qty'] 		= v_qty;
		loc_newBillLineObj['disc'] 		= v_disc;
		loc_newBillLineObj['net'] 		= v_net;
		loc_newBillLineObj['discPer']   = parseFloat(v_disc_per).toFixed(2);
		
		    
  	    /*if (!g_itemNameList.includes(v_itemName))
        {
		    g_itemNameList.push(v_itemName);
		    localStorage.setItem('itemNameList', g_itemNameList);
		}*/
		
		//-------
		for (let i = 0; i < g_newBillLine.length; i++) 
		{
  			v_updated = 0;
  		
    		if (g_newBillLine[i].itemId === v_itemId && g_newBillLine[i].price === v_price) 
			{
			    
		        g_newBillLine[i].qty 		= (Number(g_newBillLine[i].qty) + Number(v_qty));
		        g_newBillLine[i].price		= v_price;
			    g_newBillLine[i].net 		= (Number(g_newBillLine[i].qty) * Number(g_newBillLine[i].price))-(Number(g_newBillLine[i].disc) + Number(loc_newBillLineObj['disc']));
			    g_newBillLine[i].disc		= (Number(g_newBillLine[i].disc) + Number(loc_newBillLineObj['disc']));
    		    v_disc_per                  = ((parseFloat(g_newBillLine[i].disc) / (parseFloat(g_newBillLine[i].price) * parseInt(g_newBillLine[i].qty)))*100);
    		    g_newBillLine[i].discPer    = parseFloat(v_disc_per).toFixed(2);
    		    loc_newBillLineObj['qty'] 	= g_newBillLine[i].qty;
    		    v_updated 					= 1;
	    		break;
   			}
    	}
    	
		//-------
		if (v_updated==0){ g_newBillLine.push(loc_newBillLineObj); }
		//-------
		
		simpleDrawBillLineTable();
		updateTotalBlock();
		resetLineFields();
		
  	}
}

//Author: Muhammad Saim
//Method: simple draw bill line Table
function simpleDrawBillLineTable()
{
  var v_cell1,v_cell2,v_cell3,v_cell4,v_cell5,v_cell6,v_cell7,v_table,v_buttonHtml,v_row,v_rowNum;
  //-------
  $("#lineRows").html("");
  v_table = document.getElementById("lineRows");
  
  // Sort g_newBillLine by itemId in descending order
    g_newBillLine.sort((a, b) => b.itemId - a.itemId);

  
  //-------
  $.each(g_newBillLine, function(i, rows) {
	v_buttonHtml 	= "<button onclick='removeSimpleBillLine("+i+");' class='btn btn-danger rounded-pill btn-sm px-3' type='button'><svg xmlns='cons/bag-x.svg' width='18' height='18' fill='currentColor' class='bi bi-bag-x' viewBox='0 0 16 16'><path fill-rule='evenodd' d='M6.146 8.146a.5.5 0 0 1 .708 0L8 9.293l1.146-1.147a.5.5 0 1 1 .708.708L8.707 10l1.147 1.146a.5.5 0 0 1-.708.708L8 10.707l-1.146 1.147a.5.5 0 0 1-.708-.708L7.293 10 6.146 8.854a.5.5 0 0 1 0-.708'/><path d='M8 1a2.5 2.5 0 0 1 2.5 2.5V4h-5v-.5A2.5 2.5 0 0 1 8 1m3.5 3v-.5a3.5 3.5 0 1 0-7 0V4H1v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V4zM2 5h12v9a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1z'/></svg></button>";
	v_row 			= v_table.insertRow(i);
	v_rowNum 		= i+1;
	//-------
    v_cell1 = v_row.insertCell(0);
    v_cell2 = v_row.insertCell(1);
    v_cell3 = v_row.insertCell(2);
    v_cell4 = v_row.insertCell(3);
    v_cell5 = v_row.insertCell(4);
    v_cell6 = v_row.insertCell(5);
    v_cell7 = v_row.insertCell(6);
    v_cell8 = v_row.insertCell(7);
	//-------
    v_cell1.innerHTML = `<center>`+ v_rowNum +"</center>";
    v_cell2.innerHTML = `<center>`+rows.itemName+`</center>`;
    v_cell3.innerHTML = `<center><input type='number' onblur='editSimpleBillLineNet(`+rows.itemId+`,"PER")' class='form-control bg-transparent border-0 text-center p-0 m-0' id='price-`+rows.itemId+`' value='`+rows.price+`'></center>`;
    v_cell4.innerHTML = `<center class='m-0'><input type='number' onblur='editSimpleBillLineNet(`+rows.itemId+`,"PER")' class='form-control bg-transparent border-0 text-center p-0 m-0' id='qty-`+rows.itemId+`' value='`+rows.qty+`'></center>`;
    v_cell5.innerHTML = `<center class='m-0'><input type='number' onblur='editSimpleBillLineNet(`+rows.itemId+`,"PER")' class='form-control bg-transparent border-0 text-center p-0 m-0' id='disc-percentage-`+rows.itemId+`' value='`+rows.discPer+`'></center>`;
    v_cell6.innerHTML = `<center class='m-0'><input type='number' onblur='editSimpleBillLineNet(`+rows.itemId+`,"AMT")' class='form-control bg-transparent border-0 text-center p-0 m-0' id='disc-`+rows.itemId+`' value='`+rows.disc+`'></center>`;
    v_cell7.innerHTML = `<center><span id='net-`+rows.itemId+`' >`+rows.net+`/-</span></center>`;
    v_cell8.innerHTML = `<center>`+v_buttonHtml+`</center>`;
  });
  updateTotalBlock();
}


//Author: Muhammad Saim
//Method: update date and time
function updateDateTimeNavSpan()
{
    var datetime           = new Date().toLocaleString().replace(',','');
    $('#nav-span').text(datetime);
}


//Author: Muhammad Saim
//Method: create simple Bill
function createSimpleBill()
{
	const date = new Date();
	var v_newBillData = {};
	var v_previousBillData = [];
	var v_previousBillDataArray = [];
	var v_uniqueCode = g_uniqueCode;
	g_itemIdCounter = 0;

	if (g_editErrorFlag==0 && g_newBillLine.length>0)
	{
		v_newBillData['invoice_code']		= g_uniqueCode;
		v_newBillData['counter_name']		= localStorage.getItem("hostName");
		v_newBillData['user_id']			= g_uniqueCode;
		v_newBillData['invoice_date']		= date.getFullYear()+"-"+Number(parseInt(date.getMonth())+parseInt(1))+"-"+date.getDate()+" "+date.getHours()+":"+date.getMinutes()+":"+date.getSeconds();
		v_newBillData['invoice_total']		= $('#li-total-amount').text();
		v_newBillData['invoice_discount']	= $('#li-discount-amount').text();
		v_newBillData['invoice_net']		= $('#li-net-amount').text();
		v_newBillData['payment_mode']		= $('#li-payment-mode').val();
		v_newBillData['customer'] 		    = $('#li-customer-data').val();
		v_newBillData['invoice_lines'] 		= g_newBillLine;
		

		if (localStorage.getItem("invoicesData"))
		{
			v_previousBillData = JSON.parse(localStorage.getItem("invoicesData"));
			for (let i = 0; i < v_previousBillData.length; i++) 
			{	
				v_previousBillDataArray.push($.makeArray(v_previousBillData[i]));
			}
			v_previousBillDataArray.push($.makeArray(v_newBillData));
			localStorage.setItem("invoicesData", JSON.stringify(v_previousBillDataArray));	
		}
		else
		{
			localStorage.setItem("invoicesData",JSON.stringify($.makeArray(v_newBillData)));	
		}

		g_newBillLine = [];
		getUniqueCode();
		$('#li-total-amount').html(Number(0));
		$('#li-discount-amount').html(Number(0));
		$('#li-net-amount').html(Number(0));
		simpleDrawBillLineTable();
		window.open("print.html?invoice="+v_uniqueCode+"","MsgWindow", "width=800,height=500");
	}
	else
	{
		popup("Bill / Invoice Error", "Please enter data correctly and try again/");
	}

}


//Author: Muhammad Saim
//Method: calculate Line discount amount and percentage
function calLineDisAmtAndPer(_itemId,_price,_qty,_disPer,_disAmt,_flag)
{
    var v_discPer = parseFloat(_disPer);
    var v_disAmt = parseFloat(_disAmt);
    var v_discountAmount, v_discountPercentage;
    if (v_discPer && _flag=="PER")
    {
        v_discountAmount = (((parseFloat(_price) * parseFloat(_qty))*(v_discPer))/100);
        v_discountAmount = parseFloat(v_discountAmount).toFixed(2);
        $('#disc-'+_itemId).val(v_discountAmount);
    }
    else if (v_disAmt && _flag=="AMT")
    {
        v_discountPercentage = (((v_disAmt)/(parseInt(_price) * parseInt(_qty)))*100);
        v_discountPercentage = parseFloat(v_discountPercentage).toFixed(2);
        $('#disc-percentage-'+_itemId).val(v_discountPercentage);
    }
    
    
}

//Author: Muhammad Saim
//Method: calculate edit simple line net
function editSimpleBillLineNet(_itemId,_flag)
{
    debugger;
	var v_net; 
	var v_price				= $( "#price-"+_itemId ).val();
	g_editErrorFlag 		= 0;
	calLineDisAmtAndPer(_itemId,v_price,$( "#qty-"+_itemId ).val(),$( "#disc-percentage-"+_itemId ).val(),$( "#disc-"+_itemId ).val(),_flag);
	v_net 				= (((v_price) * ($( "#qty-"+_itemId ).val())) - ($( "#disc-"+_itemId ).val()));
	$( "#net-"+_itemId ).text(v_net);
	updateBillLine(_itemId);
}

//Author: Muhammad Saim
//Method: Remove bill line
function removeSimpleBillLine(_rowIndex)
{	
	g_newBillLine.splice(_rowIndex, 1);
	simpleDrawBillLineTable();
}

///=============================
///-------Simple Bill-----------
///=============================

//Author: Muhammad Saim
//Method: open pos
function openPOS()
{
  window.open("index.html");   
}

//Author: Muhammad Saim
//Method: save shop detail
function saveShopDetail()
{
    var shopName = $("#shop-name").val();
    var shopDetail = $("#shop-detail").val();
    
    if (shopName)
    { 
        localStorage.setItem('shopName', shopName); 
        $("#shop-name").val(localStorage.getItem('shopName'));
    }
    
    if (shopDetail) 
    { 
        localStorage.setItem('shopDetail', shopDetail); 
        $("#shop-detail").val(localStorage.getItem('shopDetail'));
    }
    
}

//Author: Muhammad Saim
//Method: set zero json node default data
function zeroNodeDefaultData()
{
    var invoice_data = [{"invoice_code": "NA","counter_name": "NA","user_id": "9999","invoice_date": "NA","invoice_total": "0","invoice_discount": "0","invoice_net": "0","payment_mode": "NA","customer": "NA", "invoice_lines": [{"itemId": "NA","itemName": "NA","price": "0","qty": "0","disc": "0","net": "0","discPer": "0.00"}]}];
    if (!localStorage.getItem("invoicesData"))
    {
        localStorage.setItem("invoicesData",JSON.stringify(invoice_data));	
    }
	
	if (localStorage.getItem('itemNameList'))
	{
		g_itemArray = localStorage.getItem('itemData');
	}
}


///=================================
///-----Sync data on cloud----------
///=================================

//Author: Muhammad Saim
//Method: get invoice count
function getInvoiceCount()
{
    $("#cloud-key").val();
    
    if (localStorage.getItem("cloudKey"))
    {
        $("#cloud-key").val(localStorage.getItem("cloudKey"));
    }
    
	var bill = JSON.parse(localStorage.getItem("invoicesData"));
	if (bill.length>1)
	{
	    $("#device-status").html(Number(bill.length - 1) +" Invoices are ready to sync to the cloud.");
	}
	else
	{
	    $("#device-status").html("Nothing to sync on the cloud.");
	}
}


//Author: Muhammad Saim
//Method: sync Local Storage Bills
function syncLocalStorageBills()
{
	var bill = JSON.parse(localStorage.getItem("invoicesData"));
	var plateform = "OpenPOS";
    var cloudKey = $("#cloud-key").val();
    localStorage.setItem("cloudKey",cloudKey);
	$("#cloud-status").html("<center>Data uploading...</center>");
    
    if (cloudKey)
    {
    	if (bill.length>1)
    	{
    		var mydata={ 
    			key  : cloudKey,
				plateform : plateform,
    			data : localStorage.getItem("invoicesData")
    		};
    	
    		$.ajax({
    	    	url: endpoint+'save_sale_data',
    			type: "POST",
    			data: mydata,  
				async: false,
    			success: 
    			function(data)
    			{ 
				
    				var dataafter = JSON.parse(data);
    				if (dataafter.status == 200)
    				{
						
    					 localStorage.setItem("invoicesData", "");
    					 $("#device-status").html("All data is uploaded on the saimtech cloud. :)");
    					 $("#cloud-status").html("<center>"+Number(bill.length - 1) + " Invoices are uploaded on the saimtech cloud.</center>");
    				}
					else if (dataafter.status == 401)
					{
						popup("Authentication error", "Cloud key is not valid. Try wiith correct cloud key.");
    					$("#cloud-status").html("");		
					}
    				else
    				{
    					popup("Sync Error", "Something went wrong during sync. Please trg again.");
    					$("#cloud-status").html("");
    				}
    			}
    		}); 
    	}	
    	else
    	{
    		popup("Already Sync", "All bills or inovices are already upload on Cloud.");
    	}
        
    }
    else
    {
        popup("Cloud key is missing", "If you don't have a cloud key, no worries! Connect with us on WhatsApp at 03234088016, and we'll assist you.");
    }
    
}

