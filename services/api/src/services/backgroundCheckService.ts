/**
 * Background Check Service for RELOConnect
 * Integrates with third-party providers for criminal background checks,
 * credit checks, and employment verification
 */

interface BackgroundCheckRequest {
  entityId: string;
  entityType: 'driver' | 'assistant' | 'owner';
  personalInfo: {
    fullName: string;
    idNumber: string;
    dateOfBirth: string;
    address?: string;
  };
  checkTypes: BackgroundCheckType[];
}

interface BackgroundCheckResult {
  checkId: string;
  status: 'pending' | 'completed' | 'failed';
  overallResult: 'clear' | 'flagged' | 'rejected';
  riskScore: number; // 0-100
  checks: {
    [key in BackgroundCheckType]?: {
      status: 'clear' | 'flagged' | 'failed';
      details: string;
      score: number;
      lastChecked: string;
    };
  };
  recommendations: string[];
  flaggedItems: Array<{
    type: string;
    description: string;
    severity: 'low' | 'medium' | 'high';
    date?: string;
  }>;
  completedAt?: string;
  expiresAt: string;
}

enum BackgroundCheckType {
  CRIMINAL_RECORD = 'criminal_record',
  CREDIT_CHECK = 'credit_check',
  EMPLOYMENT_HISTORY = 'employment_history',
  SANCTIONS_LIST = 'sanctions_list',
  ADVERSE_MEDIA = 'adverse_media',
  IDENTITY_VERIFICATION = 'identity_verification',
  ADDRESS_VERIFICATION = 'address_verification',
  PROFESSIONAL_LICENSE = 'professional_license'
}

class BackgroundCheckService {
  private apiKey: string;
  private apiUrl: string;
  private retryAttempts: number = 3;

  constructor() {
    this.apiKey = process.env.BACKGROUND_CHECK_API_KEY || '';
    this.apiUrl = process.env.BACKGROUND_CHECK_API_URL || 'https://api.backgroundcheck.co.za';
  }

  /**
   * Initiate comprehensive background check
   */
  async performBackgroundCheck(request: BackgroundCheckRequest): Promise<BackgroundCheckResult> {
    try {
      // In production, integrate with actual background check providers
      // For South Africa: consider services like illion, TransUnion, or Compuscan
      
      const checkId = `bg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Simulate different risk levels based on entity type and check types
      const riskScore = this.calculateRiskScore(request);
      const overallResult = this.determineOverallResult(riskScore);
      
      const result: BackgroundCheckResult = {
        checkId,
        status: 'completed',
        overallResult,
        riskScore,
        checks: {},
        recommendations: [],
        flaggedItems: [],
        completedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() // 1 year
      };

      // Perform individual checks
      for (const checkType of request.checkTypes) {
        result.checks[checkType] = await this.performIndividualCheck(
          checkType,
          request.personalInfo
        );
      }

      // Generate recommendations
      result.recommendations = this.generateRecommendations(result);
      
      // Generate flagged items if any
      result.flaggedItems = this.generateFlaggedItems(result);

      return result;

    } catch (error) {
      console.error('Background check error:', error);
      throw new Error('Failed to perform background check');
    }
  }

  /**
   * Perform individual background check
   */
  private async performIndividualCheck(
    checkType: BackgroundCheckType,
    personalInfo: any
  ): Promise<any> {
    // Simulate API calls to different services
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

    switch (checkType) {
      case BackgroundCheckType.CRIMINAL_RECORD:
        return this.performCriminalRecordCheck(personalInfo);
      
      case BackgroundCheckType.CREDIT_CHECK:
        return this.performCreditCheck(personalInfo);
      
      case BackgroundCheckType.EMPLOYMENT_HISTORY:
        return this.performEmploymentCheck(personalInfo);
      
      case BackgroundCheckType.SANCTIONS_LIST:
        return this.performSanctionsCheck(personalInfo);
      
      case BackgroundCheckType.ADVERSE_MEDIA:
        return this.performAdverseMediaCheck(personalInfo);
      
      case BackgroundCheckType.IDENTITY_VERIFICATION:
        return this.performIdentityVerification(personalInfo);
      
      case BackgroundCheckType.ADDRESS_VERIFICATION:
        return this.performAddressVerification(personalInfo);
      
      case BackgroundCheckType.PROFESSIONAL_LICENSE:
        return this.performProfessionalLicenseCheck(personalInfo);
      
      default:
        return {
          status: 'failed',
          details: 'Unknown check type',
          score: 0,
          lastChecked: new Date().toISOString()
        };
    }
  }

  /**
   * Criminal record check simulation
   */
  private performCriminalRecordCheck(personalInfo: any) {
    // Simulate different outcomes
    const outcomes = [
      { status: 'clear', details: 'No criminal record found', score: 100 },
      { status: 'flagged', details: 'Minor traffic violations found', score: 85 },
      { status: 'flagged', details: 'Previous theft conviction (2018)', score: 40 },
      { status: 'clear', details: 'Clean criminal record', score: 100 }
    ];

    // 90% chance of clear record for simulation
    const outcome = Math.random() < 0.9 ? outcomes[0] : outcomes[Math.floor(Math.random() * outcomes.length)];
    
    return {
      ...outcome,
      lastChecked: new Date().toISOString()
    };
  }

  /**
   * Credit check simulation
   */
  private performCreditCheck(personalInfo: any) {
    const creditScore = Math.floor(Math.random() * 400) + 400; // 400-800 range
    
    let status: 'clear' | 'flagged' | 'failed';
    let details: string;
    let score: number;

    if (creditScore >= 700) {
      status = 'clear';
      details = `Excellent credit score: ${creditScore}`;
      score = 95;
    } else if (creditScore >= 600) {
      status = 'clear';
      details = `Good credit score: ${creditScore}`;
      score = 80;
    } else if (creditScore >= 500) {
      status = 'flagged';
      details = `Fair credit score: ${creditScore}. Some payment delays found`;
      score = 65;
    } else {
      status = 'flagged';
      details = `Poor credit score: ${creditScore}. Multiple defaults found`;
      score = 30;
    }

    return {
      status,
      details,
      score,
      lastChecked: new Date().toISOString()
    };
  }

  /**
   * Employment history verification
   */
  private performEmploymentCheck(personalInfo: any) {
    const outcomes = [
      { status: 'clear', details: 'Employment history verified with 3 employers', score: 100 },
      { status: 'clear', details: 'Employment history verified with 2 employers', score: 90 },
      { status: 'flagged', details: 'Gap in employment history (6 months)', score: 75 },
      { status: 'flagged', details: 'Unable to verify 1 previous employer', score: 60 }
    ];

    const outcome = outcomes[Math.floor(Math.random() * outcomes.length)];
    
    return {
      ...outcome,
      lastChecked: new Date().toISOString()
    };
  }

  /**
   * Sanctions list check
   */
  private performSanctionsCheck(personalInfo: any) {
    // 99.9% chance of being clear
    const isClear = Math.random() < 0.999;
    
    return {
      status: isClear ? 'clear' : 'flagged',
      details: isClear ? 'No matches found on sanctions lists' : 'Potential match on watch list - requires manual review',
      score: isClear ? 100 : 0,
      lastChecked: new Date().toISOString()
    };
  }

  /**
   * Adverse media check
   */
  private performAdverseMediaCheck(personalInfo: any) {
    const outcomes = [
      { status: 'clear', details: 'No adverse media coverage found', score: 100 },
      { status: 'flagged', details: 'Minor negative news coverage found (traffic incident)', score: 80 },
      { status: 'flagged', details: 'Business-related court case mentioned in media', score: 60 }
    ];

    // 95% chance of being clear
    const outcome = Math.random() < 0.95 ? outcomes[0] : outcomes[Math.floor(Math.random() * outcomes.length)];
    
    return {
      ...outcome,
      lastChecked: new Date().toISOString()
    };
  }

  /**
   * Identity verification
   */
  private performIdentityVerification(personalInfo: any) {
    // Simulate ID verification against Home Affairs database
    const isValid = this.validateSouthAfricanID(personalInfo.idNumber);
    
    return {
      status: isValid ? 'clear' : 'failed',
      details: isValid ? 'ID number verified against Home Affairs database' : 'ID number not found in official records',
      score: isValid ? 100 : 0,
      lastChecked: new Date().toISOString()
    };
  }

  /**
   * Address verification
   */
  private performAddressVerification(personalInfo: any) {
    if (!personalInfo.address) {
      return {
        status: 'failed',
        details: 'Address not provided',
        score: 0,
        lastChecked: new Date().toISOString()
      };
    }

    const outcomes = [
      { status: 'clear', details: 'Address verified through utility records', score: 100 },
      { status: 'clear', details: 'Address verified through postal records', score: 95 },
      { status: 'flagged', details: 'Address partially verified - requires additional proof', score: 70 },
      { status: 'failed', details: 'Address could not be verified', score: 30 }
    ];

    // 85% chance of verification
    const outcome = Math.random() < 0.85 ? outcomes[0] : outcomes[Math.floor(Math.random() * outcomes.length)];
    
    return {
      ...outcome,
      lastChecked: new Date().toISOString()
    };
  }

  /**
   * Professional license verification
   */
  private performProfessionalLicenseCheck(personalInfo: any) {
    // For drivers, this would check their license against NATIS database
    const outcomes = [
      { status: 'clear', details: 'Professional driving license verified and active', score: 100 },
      { status: 'flagged', details: 'License valid but has points/endorsements', score: 75 },
      { status: 'failed', details: 'License expired or suspended', score: 0 }
    ];

    // 90% chance of valid license
    const outcome = Math.random() < 0.9 ? outcomes[0] : outcomes[Math.floor(Math.random() * outcomes.length)];
    
    return {
      ...outcome,
      lastChecked: new Date().toISOString()
    };
  }

  /**
   * Calculate overall risk score
   */
  private calculateRiskScore(request: BackgroundCheckRequest): number {
    // Base risk score varies by entity type
    let baseScore = 70;
    
    switch (request.entityType) {
      case 'driver':
        baseScore = 80; // Higher trust for drivers
        break;
      case 'assistant':
        baseScore = 75;
        break;
      case 'owner':
        baseScore = 85; // Business owners get higher base score
        break;
    }

    // Add randomness for simulation
    const variation = (Math.random() - 0.5) * 40; // ±20 points
    const finalScore = Math.max(0, Math.min(100, baseScore + variation));
    
    return Math.round(finalScore);
  }

  /**
   * Determine overall result
   */
  private determineOverallResult(riskScore: number): 'clear' | 'flagged' | 'rejected' {
    if (riskScore >= 80) return 'clear';
    if (riskScore >= 60) return 'flagged';
    return 'rejected';
  }

  /**
   * Generate recommendations
   */
  private generateRecommendations(result: BackgroundCheckResult): string[] {
    const recommendations: string[] = [];
    
    if (result.overallResult === 'clear') {
      recommendations.push('Candidate approved for onboarding');
      recommendations.push('Standard monitoring recommended');
    } else if (result.overallResult === 'flagged') {
      recommendations.push('Manual review required before approval');
      recommendations.push('Consider probationary period');
      recommendations.push('Enhanced monitoring recommended');
    } else {
      recommendations.push('Candidate not recommended for approval');
      recommendations.push('Consider rejection or request additional information');
    }

    // Add specific recommendations based on checks
    Object.entries(result.checks).forEach(([checkType, checkResult]) => {
      if (checkResult?.status === 'flagged') {
        switch (checkType) {
          case 'credit_check':
            recommendations.push('Consider requiring deposit or guarantor');
            break;
          case 'criminal_record':
            recommendations.push('Review criminal history details with legal team');
            break;
          case 'employment_history':
            recommendations.push('Verify employment gaps during interview');
            break;
        }
      }
    });

    return recommendations;
  }

  /**
   * Generate flagged items
   */
  private generateFlaggedItems(result: BackgroundCheckResult): Array<any> {
    const flaggedItems: Array<any> = [];
    
    Object.entries(result.checks).forEach(([checkType, checkResult]) => {
      if (checkResult?.status === 'flagged') {
        flaggedItems.push({
          type: checkType,
          description: checkResult.details,
          severity: checkResult.score > 70 ? 'low' : checkResult.score > 40 ? 'medium' : 'high',
          date: checkResult.lastChecked
        });
      }
    });

    return flaggedItems;
  }

  /**
   * Validate South African ID number
   */
  private validateSouthAfricanID(idNumber: string): boolean {
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
   * Get background check status
   */
  async getBackgroundCheckStatus(checkId: string): Promise<BackgroundCheckResult | null> {
    try {
      // In production, this would query the background check provider's API
      // For now, simulate a response
      
      console.log(`Retrieving background check status for: ${checkId}`);
      
      // Simulate that check doesn't exist
      if (Math.random() < 0.1) {
        return null;
      }
      
      // Return mock result
      return {
        checkId,
        status: 'completed',
        overallResult: 'clear',
        riskScore: 85,
        checks: {},
        recommendations: ['Candidate approved for onboarding'],
        flaggedItems: [],
        completedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
      };
      
    } catch (error) {
      console.error('Error retrieving background check:', error);
      return null;
    }
  }

  /**
   * Check if background check is still valid
   */
  isBackgroundCheckValid(result: BackgroundCheckResult): boolean {
    const expiryDate = new Date(result.expiresAt);
    return expiryDate > new Date();
  }
}

export default BackgroundCheckService;
export { BackgroundCheckType, type BackgroundCheckRequest, type BackgroundCheckResult };
