import sharp from 'sharp';

interface DocumentData {
  // Common fields
  extractedText: string;
  confidence: number;
  documentType: string;
  isValid: boolean;
  issueDate?: string;
  expiryDate?: string;
  issuer?: string;
  
  // ID Document specific
  idNumber?: string;
  fullName?: string;
  dateOfBirth?: string;
  nationality?: string;
  address?: string;
  
  // Driver's License specific
  licenseNumber?: string;
  licenseClass?: string;
  restrictions?: string[];
  
  // Vehicle Document specific
  vehicleRegistrationNumber?: string;
  make?: string;
  model?: string;
  year?: string;
  engineNumber?: string;
  chassisNumber?: string;
  
  // Insurance specific
  policyNumber?: string;
  insuredValue?: string;
  coverageType?: string;
  
  // Business Document specific
  companyName?: string;
  businessRegistrationNumber?: string;
  vatNumber?: string;
  directors?: string[];
}

/**
 * Extract data from South African ID document
 */
function parseIDDocument(text: string): Partial<DocumentData> {
  const data: Partial<DocumentData> = {
    documentType: 'ID_DOCUMENT'
  };
  
  // South African ID number pattern: YYMMDDGGGGGCZ
  const idMatch = text.match(/\b(\d{13})\b/);
  if (idMatch) {
    data.idNumber = idMatch[1];
    
    // Extract date of birth from ID number
    const year = parseInt(idMatch[1].substring(0, 2));
    const month = idMatch[1].substring(2, 4);
    const day = idMatch[1].substring(4, 6);
    
    // Determine century (if year < 22, assume 2000s, else 1900s)
    const fullYear = year < 22 ? 2000 + year : 1900 + year;
    data.dateOfBirth = `${fullYear}-${month}-${day}`;
  }
  
  // Extract full name (typically appears on ID cards)
  const namePatterns = [
    /SURNAME[:\s]+([A-Z\s]+)/i,
    /FIRST\s*NAME[:\s]+([A-Z\s]+)/i,
    /NAMES[:\s]+([A-Z\s]+)/i
  ];
  
  let fullName = '';
  namePatterns.forEach(pattern => {
    const match = text.match(pattern);
    if (match) {
      fullName += (fullName ? ' ' : '') + match[1].trim();
    }
  });
  
  if (fullName) {
    data.fullName = fullName;
  }
  
  // Extract nationality
  const nationalityMatch = text.match(/NATIONALITY[:\s]+([A-Z\s]+)/i);
  if (nationalityMatch) {
    data.nationality = nationalityMatch[1].trim();
  }
  
  // Check if ID is valid (basic validation)
  data.isValid = !!data.idNumber && data.idNumber.length === 13;
  
  return data;
}

/**
 * Extract data from driver's license
 */
function parseDriversLicense(text: string): Partial<DocumentData> {
  const data: Partial<DocumentData> = {
    documentType: 'DRIVERS_LICENSE'
  };
  
  // License number patterns
  const licensePatterns = [
    /LICENSE\s*NO[:\s]+([A-Z0-9]+)/i,
    /LICENCE\s*NO[:\s]+([A-Z0-9]+)/i,
    /LIC[:\s]+([A-Z0-9]+)/i
  ];
  
  for (const pattern of licensePatterns) {
    const match = text.match(pattern);
    if (match) {
      data.licenseNumber = match[1].trim();
      break;
    }
  }
  
  // License class
  const classMatch = text.match(/CLASS[:\s]+([A-Z0-9]+)/i);
  if (classMatch) {
    data.licenseClass = classMatch[1].trim();
  }
  
  // Expiry date
  const expiryPatterns = [
    /EXPIRES?[:\s]+(\d{2}[-/]\d{2}[-/]\d{4})/i,
    /VALID\s*UNTIL[:\s]+(\d{2}[-/]\d{2}[-/]\d{4})/i,
    /EXP[:\s]+(\d{2}[-/]\d{2}[-/]\d{4})/i
  ];
  
  for (const pattern of expiryPatterns) {
    const match = text.match(pattern);
    if (match) {
      data.expiryDate = match[1];
      break;
    }
  }
  
  // Extract restrictions
  const restrictionsMatch = text.match(/RESTRICTIONS[:\s]+([A-Z0-9\s,]+)/i);
  if (restrictionsMatch) {
    data.restrictions = restrictionsMatch[1].split(',').map(r => r.trim());
  }
  
  data.isValid = !!data.licenseNumber;
  
  return data;
}

/**
 * Extract data from vehicle registration document
 */
function parseVehicleDocument(text: string): Partial<DocumentData> {
  const data: Partial<DocumentData> = {
    documentType: 'VEHICLE_REGISTRATION'
  };
  
  // Registration number
  const regPatterns = [
    /REGISTRATION[:\s]+([A-Z0-9\s-]+)/i,
    /REG\s*NO[:\s]+([A-Z0-9\s-]+)/i,
    /LICENSE\s*NO[:\s]+([A-Z0-9\s-]+)/i
  ];
  
  for (const pattern of regPatterns) {
    const match = text.match(pattern);
    if (match) {
      data.vehicleRegistrationNumber = match[1].trim();
      break;
    }
  }
  
  // Make and model
  const makeMatch = text.match(/MAKE[:\s]+([A-Z\s]+)/i);
  if (makeMatch) {
    data.make = makeMatch[1].trim();
  }
  
  const modelMatch = text.match(/MODEL[:\s]+([A-Z0-9\s]+)/i);
  if (modelMatch) {
    data.model = modelMatch[1].trim();
  }
  
  // Year
  const yearMatch = text.match(/YEAR[:\s]+(\d{4})/i) || text.match(/MODEL\s*YEAR[:\s]+(\d{4})/i);
  if (yearMatch) {
    data.year = yearMatch[1];
  }
  
  // Engine number
  const engineMatch = text.match(/ENGINE[:\s]+([A-Z0-9]+)/i);
  if (engineMatch) {
    data.engineNumber = engineMatch[1].trim();
  }
  
  // Chassis number
  const chassisMatch = text.match(/CHASSIS[:\s]+([A-Z0-9]+)/i) || text.match(/VIN[:\s]+([A-Z0-9]+)/i);
  if (chassisMatch) {
    data.chassisNumber = chassisMatch[1].trim();
  }
  
  data.isValid = !!data.vehicleRegistrationNumber;
  
  return data;
}

/**
 * Extract data from insurance certificate
 */
function parseInsuranceDocument(text: string): Partial<DocumentData> {
  const data: Partial<DocumentData> = {
    documentType: 'INSURANCE_CERTIFICATE'
  };
  
  // Policy number
  const policyPatterns = [
    /POLICY[:\s]+([A-Z0-9-]+)/i,
    /CERTIFICATE[:\s]+([A-Z0-9-]+)/i,
    /POL[:\s]+([A-Z0-9-]+)/i
  ];
  
  for (const pattern of policyPatterns) {
    const match = text.match(pattern);
    if (match) {
      data.policyNumber = match[1].trim();
      break;
    }
  }
  
  // Insured value
  const valuePatterns = [
    /INSURED\s*VALUE[:\s]+R?\s*([0-9,\s]+)/i,
    /SUM\s*INSURED[:\s]+R?\s*([0-9,\s]+)/i,
    /AMOUNT[:\s]+R?\s*([0-9,\s]+)/i
  ];
  
  for (const pattern of valuePatterns) {
    const match = text.match(pattern);
    if (match) {
      data.insuredValue = match[1].replace(/\s/g, '');
      break;
    }
  }
  
  // Coverage type
  const coverageMatch = text.match(/COVERAGE[:\s]+([A-Z\s]+)/i) || text.match(/TYPE[:\s]+([A-Z\s]+)/i);
  if (coverageMatch) {
    data.coverageType = coverageMatch[1].trim();
  }
  
  data.isValid = !!data.policyNumber;
  
  return data;
}

/**
 * Simulate OCR processing (in production, integrate with Google Vision API or similar)
 */
async function performOCR(imageBuffer: Buffer): Promise<string> {
  // In a real implementation, this would call an OCR service
  // For now, we'll simulate OCR text extraction
  
  try {
    // Process image to improve OCR accuracy
    const processedImage = await sharp(imageBuffer)
      .resize(2048, 2048, { fit: 'inside', withoutEnlargement: true })
      .greyscale()
      .normalize()
      .sharpen()
      .jpeg({ quality: 95 })
      .toBuffer();
    
    // TODO: Integrate with actual OCR service
    // Example: Google Vision API, Tesseract, or AWS Textract
    
    // For demo purposes, return simulated text
    return `
      REPUBLIC OF SOUTH AFRICA
      IDENTITY DOCUMENT
      ID NO: 9001010001088
      SURNAME: SMITH
      FIRST NAMES: JOHN DAVID
      DATE OF BIRTH: 01/01/1990
      NATIONALITY: SOUTH AFRICAN
      VALID FROM: 01/01/2020
      VALID UNTIL: 01/01/2030
    `;
    
  } catch (error) {
    console.error('OCR processing error:', error);
    throw new Error('Failed to process document image');
  }
}

/**
 * Main function to extract document data
 */
export async function extractDocumentData(
  imageBuffer: Buffer,
  documentType: string
): Promise<DocumentData> {
  try {
    // Perform OCR on the image
    const extractedText = await performOCR(imageBuffer);
    
    // Parse the text based on document type
    let parsedData: Partial<DocumentData> = {
      extractedText,
      confidence: 0.8, // Would come from actual OCR service
      documentType
    };
    
    switch (documentType.toLowerCase()) {
      case 'id_document':
        parsedData = { ...parsedData, ...parseIDDocument(extractedText) };
        break;
      case 'drivers_license':
        parsedData = { ...parsedData, ...parseDriversLicense(extractedText) };
        break;
      case 'vehicle_document':
      case 'vehicle_registration':
        parsedData = { ...parsedData, ...parseVehicleDocument(extractedText) };
        break;
      case 'insurance_certificate':
        parsedData = { ...parsedData, ...parseInsuranceDocument(extractedText) };
        break;
      default:
        // Generic text extraction
        parsedData.isValid = extractedText.length > 50;
        break;
    }
    
    return parsedData as DocumentData;
    
  } catch (error) {
    console.error('Document extraction error:', error);
    throw new Error('Failed to extract document data');
  }
}

/**
 * Validate South African ID number
 */
export function validateSAIDNumber(idNumber: string): boolean {
  if (!idNumber || idNumber.length !== 13) {
    return false;
  }
  
  // Check if all characters are digits
  if (!/^\d{13}$/.test(idNumber)) {
    return false;
  }
  
  // Validate date portion (YYMMDD)
  const year = parseInt(idNumber.substring(0, 2));
  const month = parseInt(idNumber.substring(2, 4));
  const day = parseInt(idNumber.substring(4, 6));
  
  if (month < 1 || month > 12) return false;
  if (day < 1 || day > 31) return false;
  
  // Validate check digit (Luhn algorithm)
  const digits = idNumber.split('').map(Number);
  let sum = 0;
  
  for (let i = 0; i < 12; i++) {
    if (i % 2 === 0) {
      sum += digits[i];
    } else {
      const doubled = digits[i] * 2;
      sum += doubled > 9 ? doubled - 9 : doubled;
    }
  }
  
  const checkDigit = (10 - (sum % 10)) % 10;
  return checkDigit === digits[12];
}

/**
 * Extract date from various formats
 */
export function parseDate(dateString: string): Date | null {
  if (!dateString) return null;
  
  const formats = [
    /(\d{2})[-/](\d{2})[-/](\d{4})/, // DD/MM/YYYY or DD-MM-YYYY
    /(\d{4})[-/](\d{2})[-/](\d{2})/, // YYYY/MM/DD or YYYY-MM-DD
    /(\d{2})[-/](\d{2})[-/](\d{2})/, // DD/MM/YY or DD-MM-YY
  ];
  
  for (const format of formats) {
    const match = dateString.match(format);
    if (match) {
      let day, month, year;
      
      if (match[3] && match[3].length === 4) {
        // Full year format
        day = parseInt(match[1]);
        month = parseInt(match[2]) - 1; // JS months are 0-indexed
        year = parseInt(match[3]);
      } else if (match[3] && match[3].length === 2) {
        // 2-digit year
        day = parseInt(match[1]);
        month = parseInt(match[2]) - 1;
        year = parseInt(match[3]);
        year += year < 30 ? 2000 : 1900; // Assume < 30 means 2000s
      } else {
        // YYYY-MM-DD format
        year = parseInt(match[1]);
        month = parseInt(match[2]) - 1;
        day = parseInt(match[3]);
      }
      
      const date = new Date(year, month, day);
      if (!isNaN(date.getTime())) {
        return date;
      }
    }
  }
  
  return null;
}

export default extractDocumentData;
