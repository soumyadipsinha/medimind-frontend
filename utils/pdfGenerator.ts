export const downloadPrescriptionPDF = (prescription: any) => {
  const iframe = document.createElement('iframe');
  iframe.style.position = 'absolute';
  iframe.style.width = '800px';
  iframe.style.height = '1100px';
  iframe.style.left = '-9999px';
  iframe.style.top = '-9999px';
  document.body.appendChild(iframe);
  
  const doc = iframe.contentDocument || iframe.contentWindow?.document;
  if (!doc) return;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"></script>
        <style>
          body { font-family: system-ui, -apple-system, sans-serif; margin: 0; padding: 15px; color: #1e293b; background: white; font-size: 11px; }
          #pdf-content { max-width: 800px; margin: 0 auto; background: white; }
          .header { border-bottom: 2px solid #06b6d4; padding-bottom: 15px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: flex-start; }
          .header h1 { color: #06b6d4; margin: 0; font-size: 24px; font-weight: 800; }
          .header p { margin: 3px 0 0; color: #64748b; font-weight: 500; font-size: 11px; }
          .meta { text-align: right; color: #64748b; font-size: 10px; }
          .meta p { margin: 0 0 3px; }
          .section { margin-bottom: 20px; }
          .section h2 { font-size: 14px; color: #0f172a; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; margin-bottom: 8px; }
          .box { background: #f8fafc; padding: 10px; border-radius: 6px; border-left: 3px solid #06b6d4; font-size: 11px; line-height: 1.5; }
          table { width: 100%; border-collapse: collapse; margin-top: 5px; font-size: 11px; }
          th { background: #f1f5f9; padding: 8px; text-align: left; border-bottom: 2px solid #cbd5e1; color: #475569; }
          td { padding: 8px; border-bottom: 1px solid #e2e8f0; }
          .footer { margin-top: 40px; padding-top: 10px; border-top: 1px dashed #cbd5e1; text-align: center; color: #94a3b8; font-size: 9px; }
        </style>
      </head>
      <body>
        <div id="pdf-content">
          <div class="header">
            <div>
              <h1>MediMind</h1>
              <p>Official Medical Prescription</p>
            </div>
            <div class="meta">
              <p><strong style="color:#334155">Date:</strong> ${new Date(prescription.createdAt || Date.now()).toLocaleDateString()}</p>
              <p><strong>ID:</strong> ${prescription._id}</p>
            </div>
          </div>

          <div class="section">
            <h2>Clinical Diagnosis</h2>
            <div class="box">${prescription.diagnosis || 'No diagnosis provided'}</div>
          </div>

          <div class="section">
            <h2>Prescribed Medications</h2>
            <table>
              <thead>
                <tr>
                  <th>Medicine Name</th>
                  <th>Dosage</th>
                  <th>Frequency</th>
                  <th>Duration</th>
                </tr>
              </thead>
              <tbody>
                ${prescription.medicines?.map((med: any) => `
                  <tr>
                    <td><strong>${med.name}</strong></td>
                    <td>${med.dosage}</td>
                    <td>${med.frequency}</td>
                    <td>${med.duration}</td>
                  </tr>
                `).join('') || `<tr><td colspan="4" style="text-align:center; padding: 15px; color: #64748b;">No medications specified in this prescription.</td></tr>`}
              </tbody>
            </table>
          </div>

          ${prescription.advice ? `
          <div class="section">
            <h2>Doctor's Advice</h2>
            <div class="box">${prescription.advice}</div>
          </div>
          ` : ''}

          ${prescription.followUpDate ? `
          <div class="section" style="background: #f0fdfa; padding: 15px; border-radius: 8px; border: 1px solid #ccfbf1; color: #115e59;">
            <strong>Recommended Follow-up:</strong> ${new Date(prescription.followUpDate).toLocaleDateString()}
          </div>
          ` : ''}

          <div class="footer">
            <p style="margin: 0 0 5px;"><strong>MediMind E-Health Services</strong></p>
            <p style="margin: 0;">This document is digitally authenticated and valid without a physical signature.</p>
          </div>
        </div>
        
        <script>
          window.onload = function() {
            var element = document.getElementById('pdf-content');
            var opt = {
              margin:       0.3,
              filename:     'MediMind_Prescription_${prescription._id}.pdf',
              image:        { type: 'jpeg', quality: 1 },
              html2canvas:  { scale: 2, useCORS: true, logging: false },
              jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
            };
            
            // Execute html2pdf inside the iframe's context, isolated from the parent!
            window.html2pdf().set(opt).from(element).save().then(function() {
              window.parent.postMessage({ type: 'PDF_DONE', id: 'pdf-iframe-${prescription._id}' }, '*');
            }).catch(function(err) {
              console.error(err);
              window.parent.postMessage({ type: 'PDF_DONE', id: 'pdf-iframe-${prescription._id}' }, '*');
            });
          };
        </script>
      </body>
    </html>
  `;

  // Attach a listener to cleanup the iframe once it's done
  const iframeId = `pdf-iframe-${prescription._id}`;
  iframe.id = iframeId;
  
  const listener = (event: MessageEvent) => {
    if (event.data?.type === 'PDF_DONE' && event.data?.id === iframeId) {
      if (document.body.contains(iframe)) {
        document.body.removeChild(iframe);
      }
      window.removeEventListener('message', listener);
    }
  };
  window.addEventListener('message', listener);

  doc.open();
  doc.write(htmlContent);
  doc.close();
};

export const downloadReportPDF = (report: any) => {
  const iframe = document.createElement('iframe');
  iframe.style.position = 'absolute';
  iframe.style.width = '800px';
  iframe.style.height = '1100px';
  iframe.style.left = '-9999px';
  iframe.style.top = '-9999px';
  document.body.appendChild(iframe);
  
  const doc = iframe.contentDocument || iframe.contentWindow?.document;
  if (!doc) return;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"></script>
        <style>
          body { font-family: system-ui, -apple-system, sans-serif; margin: 0; padding: 15px; color: #1e293b; background: white; font-size: 11px; }
          #pdf-content { max-width: 800px; margin: 0 auto; background: white; }
          .header { border-bottom: 2px solid #3b82f6; padding-bottom: 15px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: flex-start; }
          .header h1 { color: #3b82f6; margin: 0; font-size: 24px; font-weight: 800; }
          .header p { margin: 3px 0 0; color: #64748b; font-weight: 500; font-size: 11px; }
          .meta { text-align: right; color: #64748b; font-size: 10px; }
          .meta p { margin: 0 0 3px; }
          .section { margin-bottom: 20px; }
          .section h2 { font-size: 16px; color: #0f172a; margin-bottom: 4px; }
          .box { background: #f8fafc; padding: 12px; border-radius: 6px; font-size: 11px; line-height: 1.6; color: #334155; white-space: pre-wrap; border: 1px solid #e2e8f0; }
          .footer { margin-top: 40px; padding-top: 10px; border-top: 1px dashed #cbd5e1; text-align: center; color: #94a3b8; font-size: 9px; }
        </style>
      </head>
      <body>
        <div id="pdf-content">
          <div class="header">
            <div>
              <h1>MediMind Labs</h1>
              <p>Official Laboratory Report</p>
            </div>
            <div class="meta">
              <p><strong style="color:#334155">Date:</strong> ${new Date(report.updatedAt || report.createdAt || Date.now()).toLocaleDateString()}</p>
              <p><strong>Report ID:</strong> ${report._id}</p>
            </div>
          </div>

          <div class="section">
            <h2>${report.test?.name || report.service?.name || "Laboratory Diagnostics"}</h2>
            <p style="color: #64748b; font-size: 14px; margin: 0;">Status: <strong style="color: #10b981;">Completed</strong></p>
          </div>

          <div class="section">
            <h3 style="font-size: 14px; margin-bottom: 8px; color: #0f172a; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px;">Test Results & Interpretation</h3>
            <div class="box">${report.resultNotes || 'Standard test parameters within normal ranges. Please consult your physician for detailed interpretation.'}</div>
          </div>

          <div class="footer">
            <p style="margin: 0 0 5px;"><strong>MediMind Laboratory Network</strong></p>
            <p style="margin: 0;">This report is generated electronically and strictly confidential.</p>
          </div>
        </div>
        
        <script>
          window.onload = function() {
            var element = document.getElementById('pdf-content');
            var opt = {
              margin:       0.3,
              filename:     'MediMind_Report_${report._id}.pdf',
              image:        { type: 'jpeg', quality: 1 },
              html2canvas:  { scale: 2, useCORS: true, logging: false },
              jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
            };
            
            // Execute html2pdf inside the iframe's context, isolated from the parent!
            window.html2pdf().set(opt).from(element).save().then(function() {
              window.parent.postMessage({ type: 'PDF_DONE', id: 'pdf-iframe-${report._id}' }, '*');
            }).catch(function(err) {
              console.error(err);
              window.parent.postMessage({ type: 'PDF_DONE', id: 'pdf-iframe-${report._id}' }, '*');
            });
          };
        </script>
      </body>
    </html>
  `;

  // Attach a listener to cleanup the iframe once it's done
  const iframeId = `pdf-iframe-${report._id}`;
  iframe.id = iframeId;
  
  const listener = (event: MessageEvent) => {
    if (event.data?.type === 'PDF_DONE' && event.data?.id === iframeId) {
      if (document.body.contains(iframe)) {
        document.body.removeChild(iframe);
      }
      window.removeEventListener('message', listener);
    }
  };
  window.addEventListener('message', listener);

  doc.open();
  doc.write(htmlContent);
  doc.close();
};
