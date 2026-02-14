import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import api from '../services/api';

interface FormData {
  title: string;
  partyAFullName: string;
  partyBFullName: string;
  partyAAddress: string;
  partyBAddress: string;
  partyADOB: string;
  partyBDOB: string;
  weddingDate: string;
  partyAAssets: string;
  partyBAssets: string;
  propertyDivision: string;
  debtResponsibility: string;
  spousalSupport: string;
  estatePlanning: string;
  additionalTerms: string;
  governingLaw: string;
  effectiveDate: string;
}

const DocumentCreate: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>();

  const prenupTemplate = {
    fields: [
      { id: 'partyAFullName', label: 'Party A Full Legal Name', type: 'text', required: true },
      { id: 'partyBFullName', label: 'Party B Full Legal Name', type: 'text', required: true },
      { id: 'partyAAddress', label: 'Party A Address', type: 'text', required: true },
      { id: 'partyBAddress', label: 'Party B Address', type: 'text', required: true },
      { id: 'partyADOB', label: 'Party A Date of Birth', type: 'date', required: true },
      { id: 'partyBDOB', label: 'Party B Date of Birth', type: 'date', required: true },
      { id: 'weddingDate', label: 'Proposed Wedding Date', type: 'date', required: true },
      { id: 'partyAAssets', label: 'Party A Separate Assets', type: 'textarea', required: true },
      { id: 'partyBAssets', label: 'Party B Separate Assets', type: 'textarea', required: true },
      { id: 'propertyDivision', label: 'Property Division Agreement', type: 'textarea', required: true },
      { id: 'debtResponsibility', label: 'Debt Responsibility', type: 'textarea', required: true },
      { id: 'spousalSupport', label: 'Spousal Support Terms', type: 'textarea', required: true },
      { id: 'estatePlanning', label: 'Estate Planning Provisions', type: 'textarea', required: true },
      { id: 'additionalTerms', label: 'Additional Terms and Conditions', type: 'textarea', required: false },
      { id: 'governingLaw', label: 'Governing Law (State)', type: 'text', required: true },
      { id: 'effectiveDate', label: 'Effective Date', type: 'date', required: true },
    ],
  };

  const onSubmit = async (data: FormData) => {
    setLoading(true);

    try {
      const documentData = {
        title: data.title,
        documentType: 'PRENUPTIAL_AGREEMENT',
        templateFields: prenupTemplate,
        fieldValues: {
          partyAFullName: data.partyAFullName,
          partyBFullName: data.partyBFullName,
          partyAAddress: data.partyAAddress,
          partyBAddress: data.partyBAddress,
          partyADOB: data.partyADOB,
          partyBDOB: data.partyBDOB,
          weddingDate: data.weddingDate,
          partyAAssets: data.partyAAssets,
          partyBAssets: data.partyBAssets,
          propertyDivision: data.propertyDivision,
          debtResponsibility: data.debtResponsibility,
          spousalSupport: data.spousalSupport,
          estatePlanning: data.estatePlanning,
          additionalTerms: data.additionalTerms,
          governingLaw: data.governingLaw,
          effectiveDate: data.effectiveDate,
        },
      };

      const response = await api.post('/documents', documentData);
      toast.success('Document created successfully! 🎉');
      navigate(`/documents/${response.data.data.id}`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create document');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pastel-purple via-pastel-pink to-pastel-blue">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link to="/dashboard" className="flex items-center text-gray-600 hover:text-gray-900">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="glass-effect rounded-2xl shadow-2xl p-8 fade-in-up">
          {/* Title Section */}
          <div className="mb-8">
            <h1 className="text-4xl font-display font-bold text-gray-900 mb-2">
              Create Prenuptial Agreement
            </h1>
            <p className="text-gray-600">
              Fill out all required fields to create your legal document. All information will be saved securely.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Document Title */}
            <div className="card bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-100">
              <h2 className="text-xl font-display font-bold text-gray-900 mb-4">Document Information</h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Document Title *
                </label>
                <input
                  type="text"
                  {...register('title', { required: 'Document title is required' })}
                  className="input-field"
                  placeholder="e.g., Prenuptial Agreement - Smith & Johnson"
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
                )}
              </div>
            </div>

            {/* Party Information */}
            <div className="card">
              <h2 className="text-xl font-display font-bold text-gray-900 mb-4 flex items-center">
                <span className="bg-purple-100 text-purple-600 rounded-full w-8 h-8 flex items-center justify-center mr-3 text-sm font-bold">1</span>
                Party Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Party A Full Legal Name *
                  </label>
                  <input
                    type="text"
                    {...register('partyAFullName', { required: 'Party A name is required' })}
                    className="input-field"
                    placeholder="John Michael Doe"
                  />
                  {errors.partyAFullName && (
                    <p className="mt-1 text-sm text-red-600">{errors.partyAFullName.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Party B Full Legal Name *
                  </label>
                  <input
                    type="text"
                    {...register('partyBFullName', { required: 'Party B name is required' })}
                    className="input-field"
                    placeholder="Jane Elizabeth Smith"
                  />
                  {errors.partyBFullName && (
                    <p className="mt-1 text-sm text-red-600">{errors.partyBFullName.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Party A Address *
                  </label>
                  <input
                    type="text"
                    {...register('partyAAddress', { required: 'Party A address is required' })}
                    className="input-field"
                    placeholder="123 Main St, City, State ZIP"
                  />
                  {errors.partyAAddress && (
                    <p className="mt-1 text-sm text-red-600">{errors.partyAAddress.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Party B Address *
                  </label>
                  <input
                    type="text"
                    {...register('partyBAddress', { required: 'Party B address is required' })}
                    className="input-field"
                    placeholder="456 Oak Ave, City, State ZIP"
                  />
                  {errors.partyBAddress && (
                    <p className="mt-1 text-sm text-red-600">{errors.partyBAddress.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Party A Date of Birth *
                  </label>
                  <input
                    type="date"
                    {...register('partyADOB', { required: 'Party A DOB is required' })}
                    className="input-field"
                  />
                  {errors.partyADOB && (
                    <p className="mt-1 text-sm text-red-600">{errors.partyADOB.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Party B Date of Birth *
                  </label>
                  <input
                    type="date"
                    {...register('partyBDOB', { required: 'Party B DOB is required' })}
                    className="input-field"
                  />
                  {errors.partyBDOB && (
                    <p className="mt-1 text-sm text-red-600">{errors.partyBDOB.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Proposed Wedding Date *
                  </label>
                  <input
                    type="date"
                    {...register('weddingDate', { required: 'Wedding date is required' })}
                    className="input-field"
                  />
                  {errors.weddingDate && (
                    <p className="mt-1 text-sm text-red-600">{errors.weddingDate.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Effective Date *
                  </label>
                  <input
                    type="date"
                    {...register('effectiveDate', { required: 'Effective date is required' })}
                    className="input-field"
                  />
                  {errors.effectiveDate && (
                    <p className="mt-1 text-sm text-red-600">{errors.effectiveDate.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Assets */}
            <div className="card">
              <h2 className="text-xl font-display font-bold text-gray-900 mb-4 flex items-center">
                <span className="bg-purple-100 text-purple-600 rounded-full w-8 h-8 flex items-center justify-center mr-3 text-sm font-bold">2</span>
                Asset Declaration
              </h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Party A Separate Assets *
                  </label>
                  <textarea
                    {...register('partyAAssets', { required: 'Party A assets are required' })}
                    rows={4}
                    className="input-field"
                    placeholder="List all separate assets including real estate, investments, business interests, inheritance, etc."
                  />
                  {errors.partyAAssets && (
                    <p className="mt-1 text-sm text-red-600">{errors.partyAAssets.message}</p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">
                    Include properties, accounts, investments, and other valuable assets owned before marriage
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Party B Separate Assets *
                  </label>
                  <textarea
                    {...register('partyBAssets', { required: 'Party B assets are required' })}
                    rows={4}
                    className="input-field"
                    placeholder="List all separate assets including real estate, investments, business interests, inheritance, etc."
                  />
                  {errors.partyBAssets && (
                    <p className="mt-1 text-sm text-red-600">{errors.partyBAssets.message}</p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">
                    Include properties, accounts, investments, and other valuable assets owned before marriage
                  </p>
                </div>
              </div>
            </div>

            {/* Terms and Conditions */}
            <div className="card">
              <h2 className="text-xl font-display font-bold text-gray-900 mb-4 flex items-center">
                <span className="bg-purple-100 text-purple-600 rounded-full w-8 h-8 flex items-center justify-center mr-3 text-sm font-bold">3</span>
                Terms and Conditions
              </h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Property Division Agreement *
                  </label>
                  <textarea
                    {...register('propertyDivision', { required: 'Property division terms are required' })}
                    rows={4}
                    className="input-field"
                    placeholder="Specify how property acquired before and during marriage will be divided in case of separation or divorce"
                  />
                  {errors.propertyDivision && (
                    <p className="mt-1 text-sm text-red-600">{errors.propertyDivision.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Debt Responsibility *
                  </label>
                  <textarea
                    {...register('debtResponsibility', { required: 'Debt responsibility terms are required' })}
                    rows={4}
                    className="input-field"
                    placeholder="Define responsibility for debts incurred before and during marriage"
                  />
                  {errors.debtResponsibility && (
                    <p className="mt-1 text-sm text-red-600">{errors.debtResponsibility.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Spousal Support Terms *
                  </label>
                  <textarea
                    {...register('spousalSupport', { required: 'Spousal support terms are required' })}
                    rows={4}
                    className="input-field"
                    placeholder="Outline any agreements regarding spousal support or alimony"
                  />
                  {errors.spousalSupport && (
                    <p className="mt-1 text-sm text-red-600">{errors.spousalSupport.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estate Planning Provisions *
                  </label>
                  <textarea
                    {...register('estatePlanning', { required: 'Estate planning provisions are required' })}
                    rows={4}
                    className="input-field"
                    placeholder="Describe estate planning arrangements including wills, trusts, and beneficiaries"
                  />
                  {errors.estatePlanning && (
                    <p className="mt-1 text-sm text-red-600">{errors.estatePlanning.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Additional Terms and Conditions
                  </label>
                  <textarea
                    {...register('additionalTerms')}
                    rows={4}
                    className="input-field"
                    placeholder="Any additional terms, conditions, or provisions (optional)"
                  />
                  <p className="mt-1 text-xs text-gray-500">Optional: Add any other agreements or provisions</p>
                </div>
              </div>
            </div>

            {/* Legal Information */}
            <div className="card">
              <h2 className="text-xl font-display font-bold text-gray-900 mb-4 flex items-center">
                <span className="bg-purple-100 text-purple-600 rounded-full w-8 h-8 flex items-center justify-center mr-3 text-sm font-bold">4</span>
                Legal Information
              </h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Governing Law (State) *
                </label>
                <select
                  {...register('governingLaw', { required: 'Governing law is required' })}
                  className="input-field"
                >
                  <option value="">Select a state...</option>
                  <option value="Alabama">Alabama</option>
                  <option value="Alaska">Alaska</option>
                  <option value="Arizona">Arizona</option>
                  <option value="Arkansas">Arkansas</option>
                  <option value="California">California</option>
                  <option value="Colorado">Colorado</option>
                  <option value="Connecticut">Connecticut</option>
                  <option value="Delaware">Delaware</option>
                  <option value="Florida">Florida</option>
                  <option value="Georgia">Georgia</option>
                  <option value="Hawaii">Hawaii</option>
                  <option value="Idaho">Idaho</option>
                  <option value="Illinois">Illinois</option>
                  <option value="Indiana">Indiana</option>
                  <option value="Iowa">Iowa</option>
                  <option value="Kansas">Kansas</option>
                  <option value="Kentucky">Kentucky</option>
                  <option value="Louisiana">Louisiana</option>
                  <option value="Maine">Maine</option>
                  <option value="Maryland">Maryland</option>
                  <option value="Massachusetts">Massachusetts</option>
                  <option value="Michigan">Michigan</option>
                  <option value="Minnesota">Minnesota</option>
                  <option value="Mississippi">Mississippi</option>
                  <option value="Missouri">Missouri</option>
                  <option value="Montana">Montana</option>
                  <option value="Nebraska">Nebraska</option>
                  <option value="Nevada">Nevada</option>
                  <option value="New Hampshire">New Hampshire</option>
                  <option value="New Jersey">New Jersey</option>
                  <option value="New Mexico">New Mexico</option>
                  <option value="New York">New York</option>
                  <option value="North Carolina">North Carolina</option>
                  <option value="North Dakota">North Dakota</option>
                  <option value="Ohio">Ohio</option>
                  <option value="Oklahoma">Oklahoma</option>
                  <option value="Oregon">Oregon</option>
                  <option value="Pennsylvania">Pennsylvania</option>
                  <option value="Rhode Island">Rhode Island</option>
                  <option value="South Carolina">South Carolina</option>
                  <option value="South Dakota">South Dakota</option>
                  <option value="Tennessee">Tennessee</option>
                  <option value="Texas">Texas</option>
                  <option value="Utah">Utah</option>
                  <option value="Vermont">Vermont</option>
                  <option value="Virginia">Virginia</option>
                  <option value="Washington">Washington</option>
                  <option value="West Virginia">West Virginia</option>
                  <option value="Wisconsin">Wisconsin</option>
                  <option value="Wyoming">Wyoming</option>
                </select>
                {errors.governingLaw && (
                  <p className="mt-1 text-sm text-red-600">{errors.governingLaw.message}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  This agreement will be governed by the laws of the selected state
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-6 border-t border-gray-200">
              <Link to="/dashboard" className="btn-secondary">
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary"
              >
                {loading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating Document...
                  </span>
                ) : (
                  <span className="flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Create Document
                  </span>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DocumentCreate;
