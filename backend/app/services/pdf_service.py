import io
from datetime import datetime, timezone
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle

class PDFService:
    def __init__(self):
        self.styles = getSampleStyleSheet()
        self.title_style = ParagraphStyle(
            'TitleStyle',
            parent=self.styles['Heading1'],
            fontSize=24,
            spaceAfter=30,
            textColor=colors.HexColor("#1A202C")
        )
        self.heading_style = ParagraphStyle(
            'HeadingStyle',
            parent=self.styles['Heading2'],
            fontSize=16,
            spaceBefore=20,
            spaceAfter=10,
            textColor=colors.HexColor("#2D3748")
        )
        self.normal_style = self.styles['Normal']
        self.mono_style = ParagraphStyle(
            'MonoStyle',
            parent=self.styles['Normal'],
            fontName='Courier',
            fontSize=10,
            textColor=colors.HexColor("#4A5568")
        )

    def generate_compliance_dossier(self, pipeline_data: dict, verification_results: dict) -> bytes:
        """
        Generates a PDF compliance dossier for an inference pipeline.
        Returns the PDF as bytes.
        """
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(
            buffer,
            pagesize=letter,
            rightMargin=72,
            leftMargin=72,
            topMargin=72,
            bottomMargin=72
        )
        
        elements = []
        
        # Header
        elements.append(Paragraph("VISIGRITY", self.title_style))
        elements.append(Paragraph("Integrity Behind Every Vision", self.heading_style))
        elements.append(Spacer(1, 20))
        
        elements.append(Paragraph("Compliance Dossier", self.styles['Heading1']))
        elements.append(Paragraph(f"Generated: {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M:%S')} UTC", self.normal_style))
        elements.append(Spacer(1, 20))
        
        # Pipeline Info Table
        elements.append(Paragraph("Pipeline Details", self.heading_style))
        
        pipeline_info = [
            ["Inference ID", pipeline_data.get('inference_id', 'N/A')],
            ["Dataset ID", pipeline_data.get('dataset_id', 'N/A')],
            ["Model ID", pipeline_data.get('model_id', 'N/A')],
            ["Status", pipeline_data.get('status', 'N/A')],
        ]
        
        t = Table(pipeline_info, colWidths=[150, 300])
        t.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (0, -1), colors.HexColor("#EDF2F7")),
            ('TEXTCOLOR', (0, 0), (-1, -1), colors.HexColor("#2D3748")),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 12),
            ('TOPPADDING', (0, 0), (-1, -1), 12),
            ('GRID', (0, 0), (-1, -1), 1, colors.HexColor("#E2E8F0")),
        ]))
        elements.append(t)
        elements.append(Spacer(1, 20))
        
        # Hashes
        elements.append(Paragraph("Cryptographic Fingerprints", self.heading_style))
        
        hashes = [
            ["Input Hash", pipeline_data.get('input_hash', 'N/A')],
            ["Model Hash", pipeline_data.get('model_hash', 'N/A')],
            ["Output Hash", pipeline_data.get('output_hash', 'N/A')]
        ]
        
        t2 = Table(hashes, colWidths=[150, 300])
        t2.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (0, -1), colors.HexColor("#EDF2F7")),
            ('TEXTCOLOR', (0, 0), (-1, -1), colors.HexColor("#2D3748")),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
            ('FONTNAME', (1, 0), (1, -1), 'Courier'),
            ('FONTSIZE', (1, 0), (1, -1), 9),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 12),
            ('TOPPADDING', (0, 0), (-1, -1), 12),
            ('GRID', (0, 0), (-1, -1), 1, colors.HexColor("#E2E8F0")),
        ]))
        elements.append(t2)
        elements.append(Spacer(1, 20))
        
        # Verification Results
        elements.append(Paragraph("Verification Results", self.heading_style))
        
        verif_data = []
        for stage, result in verification_results.items():
            status = "PASS" if result else "FAIL"
            verif_data.append([stage.replace('_', ' ').title(), status])
            
        t3 = Table(verif_data, colWidths=[300, 150])
        t3.setStyle(TableStyle([
            ('TEXTCOLOR', (0, 0), (-1, -1), colors.HexColor("#2D3748")),
            ('ALIGN', (0, 0), (0, -1), 'LEFT'),
            ('ALIGN', (1, 0), (1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, -1), 'Helvetica-Bold'),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 12),
            ('TOPPADDING', (0, 0), (-1, -1), 12),
            ('LINEBELOW', (0, 0), (-1, -1), 1, colors.HexColor("#E2E8F0")),
        ]))
        
        # Color the PASS/FAIL column
        for i, (stage, status) in enumerate(verif_data):
            color = colors.HexColor("#48BB78") if status == "PASS" else colors.HexColor("#F56565")
            t3.setStyle(TableStyle([('TEXTCOLOR', (1, i), (1, i), color)]))
            
        elements.append(t3)
        
        elements.append(Spacer(1, 40))
        elements.append(Paragraph("This document serves as an immutable record of cryptographic provenance. In a production environment, this record would be anchored to the blockchain.", self.mono_style))
        
        doc.build(elements)
        
        pdf_value = buffer.getvalue()
        buffer.close()
        return pdf_value

pdf_service = PDFService()
