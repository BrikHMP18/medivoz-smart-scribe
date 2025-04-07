
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import { toast } from "sonner";
import { PatientData, MedicalRecordFormData } from "./use-medical-record-api";

export const exportMedicalRecordPDF = async (
  patientData: PatientData | null,
  formData: MedicalRecordFormData,
  setIsExporting: (value: boolean) => void
): Promise<boolean> => {
  if (!patientData || !formData.motivo_consulta) {
    toast.error("No hay datos suficientes para exportar");
    return false;
  }
  
  setIsExporting(true);
  
  try {
    // Generate PDF
    const doc = new jsPDF();
    
    // Title
    doc.setFontSize(16);
    doc.setTextColor(59, 130, 246); // Blue color
    doc.text("FICHA MÉDICA", 105, 15, { align: "center" });
    
    // Add today's date
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100); // Gray color
    const today = new Date().toLocaleDateString('es-ES');
    doc.text(`Fecha: ${today}`, 195, 15, { align: "right" });
    
    // Patient information
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`Paciente: ${patientData.nombre}`, 14, 25);
    doc.text(`Edad: ${patientData.edad || 'No especificada'}`, 14, 32);
    
    if (patientData.ocupacion) {
      doc.text(`Ocupación: ${patientData.ocupacion}`, 14, 39);
    }
    
    if (patientData.procedencia) {
      doc.text(`Procedencia: ${patientData.procedencia}`, 14, 46);
    }
    
    // Line separator
    doc.setDrawColor(200, 200, 200); // Light gray
    doc.line(14, 50, 196, 50);
    
    // Medical record content
    doc.setFontSize(11);
    
    let yPos = 60;
    
    // Motivo de consulta
    doc.setFont(undefined, 'bold');
    doc.text("Motivo de Consulta:", 14, yPos);
    doc.setFont(undefined, 'normal');
    
    const motivoLines = doc.splitTextToSize(formData.motivo_consulta, 170);
    doc.text(motivoLines, 14, yPos + 7);
    
    yPos += 7 + (motivoLines.length * 7);
    
    // Síntomas principales
    if (formData.sintomas_principales) {
      doc.setFont(undefined, 'bold');
      doc.text("Síntomas Principales:", 14, yPos);
      doc.setFont(undefined, 'normal');
      
      const sintomasLines = doc.splitTextToSize(formData.sintomas_principales, 170);
      doc.text(sintomasLines, 14, yPos + 7);
      
      yPos += 7 + (sintomasLines.length * 7);
    }
    
    // Antecedentes relevantes
    if (formData.antecedentes_relevantes) {
      doc.setFont(undefined, 'bold');
      doc.text("Antecedentes Relevantes:", 14, yPos);
      doc.setFont(undefined, 'normal');
      
      const antecedentesLines = doc.splitTextToSize(formData.antecedentes_relevantes, 170);
      doc.text(antecedentesLines, 14, yPos + 7);
      
      yPos += 7 + (antecedentesLines.length * 7);
    }
    
    // Check if we need a new page
    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }
    
    // Diagnóstico principal
    doc.setFont(undefined, 'bold');
    doc.text("Diagnóstico Principal:", 14, yPos);
    doc.setFont(undefined, 'normal');
    
    const diagnosticoLines = doc.splitTextToSize(formData.diagnostico_principal, 170);
    doc.text(diagnosticoLines, 14, yPos + 7);
    
    yPos += 7 + (diagnosticoLines.length * 7);
    
    // Check if we need a new page
    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }
    
    // Plan de tratamiento
    doc.setFont(undefined, 'bold');
    doc.text("Plan de Tratamiento:", 14, yPos);
    doc.setFont(undefined, 'normal');
    
    const planLines = doc.splitTextToSize(formData.plan_tratamiento, 170);
    doc.text(planLines, 14, yPos + 7);
    
    yPos += 7 + (planLines.length * 7);
    
    // Notas adicionales
    if (formData.notas_adicionales) {
      // Check if we need a new page
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }
      
      doc.setFont(undefined, 'bold');
      doc.text("Notas Adicionales:", 14, yPos);
      doc.setFont(undefined, 'normal');
      
      const notasLines = doc.splitTextToSize(formData.notas_adicionales, 170);
      doc.text(notasLines, 14, yPos + 7);
    }
    
    // Save the PDF
    const fileName = `ficha_medica_${patientData.nombre.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
    
    toast.success("PDF exportado exitosamente");
    return true;
  } catch (error) {
    console.error("Error exporting PDF:", error);
    toast.error("Error al exportar el PDF");
    return false;
  } finally {
    setIsExporting(false);
  }
};
