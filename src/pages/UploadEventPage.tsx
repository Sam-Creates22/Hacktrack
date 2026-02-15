// ============================================
// HackTrack - Upload Event Page with AI Extraction
// ============================================

import React, { useState, useRef, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Database } from '@/services/database';
import { useDropzone } from 'react-dropzone';
import { 
  ArrowLeft, 
  Upload, 
  FileText, 
  Image as ImageIcon, 
  X, 
  Loader2, 
  Sparkles,
  CheckCircle,
  Calendar,
  MapPin,
  Users,
  Clock,
  Globe,
  Building,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import type { EventVisibility } from '@/types';

const UploadEventPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [extractedData, setExtractedData] = useState<any>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    eventDate: '',
    endDate: '',
    startTime: '',
    endTime: '',
    venue: '',
    isOnline: false,
    onlineLink: '',
    registrationDeadline: '',
    teamSizeMin: 1,
    teamSizeMax: 4,
    instructions: '',
    visibility: 'public' as EventVisibility,
  });

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      toast.error('Please upload a PDF or image file (JPG, PNG)');
      return;
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      return;
    }

    setUploadedFile(file);
    setIsExtracting(true);

    try {
      // Simulate AI extraction
      const result = await Database.AIExtraction.extractFromBrochure(file);
      
      if (result.success && result.data) {
        setExtractedData(result.data);
        
        // Auto-fill form with extracted data
        setFormData(prev => ({
          ...prev,
          title: result.data!.eventName || prev.title,
          eventDate: result.data!.date || prev.eventDate,
          startTime: result.data!.time?.split(' - ')[0] || prev.startTime,
          endTime: result.data!.time?.split(' - ')[1] || prev.endTime,
          venue: result.data!.venue || prev.venue,
          isOnline: result.data!.isOnline || prev.isOnline,
          registrationDeadline: result.data!.registrationDeadline || prev.registrationDeadline,
          instructions: result.data!.instructions || prev.instructions,
        }));

        toast.success('AI successfully extracted event details!');
      } else {
        toast.error('Failed to extract data from brochure');
      }
    } catch (error) {
      toast.error('An error occurred during extraction');
    } finally {
      setIsExtracting(false);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
    },
    maxFiles: 1,
  });

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('You must be logged in to upload an event');
      return;
    }

    // Validate required fields
    if (!formData.title || !formData.eventDate || !formData.registrationDeadline) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsUploading(true);

    try {
      const event = Database.Event.create({
        title: formData.title,
        description: formData.description,
        eventDate: new Date(formData.eventDate),
        endDate: formData.endDate ? new Date(formData.endDate) : undefined,
        startTime: formData.startTime,
        endTime: formData.endTime,
        venue: formData.venue,
        isOnline: formData.isOnline,
        onlineLink: formData.onlineLink,
        registrationDeadline: new Date(formData.registrationDeadline),
        teamSize: {
          min: formData.teamSizeMin,
          max: formData.teamSizeMax,
        },
        instructions: formData.instructions,
        visibility: formData.visibility,
        status: 'pending',
        createdBy: user.id,
        extractedData: extractedData ? {
          ...extractedData,
          confidence: 0.85,
        } : undefined,
      });

      toast.success('Event uploaded successfully! Waiting for admin approval.');
      navigate(`/events/${event.id}`);
    } catch (error) {
      toast.error('Failed to upload event');
    } finally {
      setIsUploading(false);
    }
  };

  const removeFile = () => {
    setUploadedFile(null);
    setExtractedData(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link to="/events">
          <Button variant="ghost" className="text-slate-400 hover:text-white -ml-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </Link>
      </div>

      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Upload Hackathon Event</h1>
        <p className="text-slate-400">
          Upload a brochure or flyer and let AI extract the event details automatically.
        </p>
      </div>

      {/* File Upload */}
      {!uploadedFile ? (
        <Card 
          {...getRootProps()} 
          className={`border-2 border-dashed cursor-pointer transition-all ${
            isDragActive 
              ? 'border-indigo-500 bg-indigo-500/10' 
              : 'border-slate-700 hover:border-slate-600 bg-slate-800/50'
          }`}
        >
          <CardContent className="p-12 text-center">
            <input {...getInputProps()} />
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center mx-auto mb-6">
              <Upload className="w-10 h-10 text-indigo-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              {isDragActive ? 'Drop your file here' : 'Upload Brochure or Flyer'}
            </h3>
            <p className="text-slate-400 mb-4">
              Drag and drop your file here, or click to browse
            </p>
            <div className="flex items-center justify-center gap-4 text-sm text-slate-500">
              <span className="flex items-center gap-1">
                <FileText className="w-4 h-4" /> PDF
              </span>
              <span className="flex items-center gap-1">
                <ImageIcon className="w-4 h-4" /> JPG, PNG
              </span>
            </div>
            <p className="text-slate-600 text-sm mt-2">Maximum file size: 10MB</p>
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center">
                  {uploadedFile.type === 'application/pdf' ? (
                    <FileText className="w-6 h-6 text-indigo-400" />
                  ) : (
                    <ImageIcon className="w-6 h-6 text-indigo-400" />
                  )}
                </div>
                <div>
                  <p className="text-white font-medium">{uploadedFile.name}</p>
                  <p className="text-slate-400 text-sm">
                    {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={removeFile} className="text-slate-400 hover:text-red-400">
                <X className="w-5 h-5" />
              </Button>
            </div>

            {isExtracting && (
              <div className="mt-6 flex items-center gap-3 p-4 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
                <Loader2 className="w-5 h-5 text-indigo-400 animate-spin" />
                <div>
                  <p className="text-indigo-400 font-medium">AI is analyzing your document...</p>
                  <p className="text-slate-400 text-sm">Extracting event details using OCR and AI</p>
                </div>
              </div>
            )}

            {extractedData && !isExtracting && (
              <div className="mt-6 p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <p className="text-green-400 font-medium">AI Extraction Complete!</p>
                </div>
                <p className="text-slate-400 text-sm">
                  We've automatically filled in the form with extracted details. Please review and make any necessary corrections.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Event Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-6 space-y-6">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-400" />
              Event Information
            </h3>

            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title" className="text-slate-300">
                Event Title <span className="text-red-400">*</span>
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                placeholder="e.g., TechHack 2025"
                className="bg-slate-800/50 border-slate-700 text-white"
                required
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-slate-300">
                Description
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Describe the hackathon event..."
                className="min-h-[100px] bg-slate-800/50 border-slate-700 text-white"
              />
            </div>

            {/* Date and Time */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="eventDate" className="text-slate-300">
                  Event Date <span className="text-red-400">*</span>
                </Label>
                <Input
                  id="eventDate"
                  type="date"
                  value={formData.eventDate}
                  onChange={(e) => handleChange('eventDate', e.target.value)}
                  className="bg-slate-800/50 border-slate-700 text-white"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate" className="text-slate-300">
                  End Date (Optional)
                </Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => handleChange('endDate', e.target.value)}
                  className="bg-slate-800/50 border-slate-700 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="startTime" className="text-slate-300">
                  Start Time
                </Label>
                <Input
                  id="startTime"
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => handleChange('startTime', e.target.value)}
                  className="bg-slate-800/50 border-slate-700 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endTime" className="text-slate-300">
                  End Time
                </Label>
                <Input
                  id="endTime"
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => handleChange('endTime', e.target.value)}
                  className="bg-slate-800/50 border-slate-700 text-white"
                />
              </div>
            </div>

            <Separator className="bg-slate-700" />

            {/* Location */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-slate-300">Location Type</Label>
                <div className="flex items-center gap-3">
                  <span className={`text-sm ${!formData.isOnline ? 'text-white' : 'text-slate-500'}`}>
                    <Building className="w-4 h-4 inline mr-1" /> Offline
                  </span>
                  <Switch
                    checked={formData.isOnline}
                    onCheckedChange={(checked) => handleChange('isOnline', checked)}
                  />
                  <span className={`text-sm ${formData.isOnline ? 'text-white' : 'text-slate-500'}`}>
                    <Globe className="w-4 h-4 inline mr-1" /> Online
                  </span>
                </div>
              </div>

              {formData.isOnline ? (
                <div className="space-y-2">
                  <Label htmlFor="onlineLink" className="text-slate-300">
                    Online Meeting Link
                  </Label>
                  <Input
                    id="onlineLink"
                    value={formData.onlineLink}
                    onChange={(e) => handleChange('onlineLink', e.target.value)}
                    placeholder="e.g., https://zoom.us/j/..."
                    className="bg-slate-800/50 border-slate-700 text-white"
                  />
                </div>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="venue" className="text-slate-300">
                    Venue
                  </Label>
                  <Input
                    id="venue"
                    value={formData.venue}
                    onChange={(e) => handleChange('venue', e.target.value)}
                    placeholder="e.g., Innovation Center, Tech Park"
                    className="bg-slate-800/50 border-slate-700 text-white"
                  />
                </div>
              )}
            </div>

            <Separator className="bg-slate-700" />

            {/* Registration & Team */}
            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="registrationDeadline" className="text-slate-300">
                  Registration Deadline <span className="text-red-400">*</span>
                </Label>
                <Input
                  id="registrationDeadline"
                  type="date"
                  value={formData.registrationDeadline}
                  onChange={(e) => handleChange('registrationDeadline', e.target.value)}
                  className="bg-slate-800/50 border-slate-700 text-white"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="teamSizeMin" className="text-slate-300">
                  Min Team Size
                </Label>
                <Input
                  id="teamSizeMin"
                  type="number"
                  min={1}
                  value={formData.teamSizeMin}
                  onChange={(e) => handleChange('teamSizeMin', parseInt(e.target.value))}
                  className="bg-slate-800/50 border-slate-700 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="teamSizeMax" className="text-slate-300">
                  Max Team Size
                </Label>
                <Input
                  id="teamSizeMax"
                  type="number"
                  min={1}
                  value={formData.teamSizeMax}
                  onChange={(e) => handleChange('teamSizeMax', parseInt(e.target.value))}
                  className="bg-slate-800/50 border-slate-700 text-white"
                />
              </div>
            </div>

            {/* Instructions */}
            <div className="space-y-2">
              <Label htmlFor="instructions" className="text-slate-300">
                Instructions & Guidelines
              </Label>
              <Textarea
                id="instructions"
                value={formData.instructions}
                onChange={(e) => handleChange('instructions', e.target.value)}
                placeholder="Any specific instructions, rules, or guidelines for participants..."
                className="min-h-[100px] bg-slate-800/50 border-slate-700 text-white"
              />
            </div>

            {/* Visibility */}
            <div className="space-y-2">
              <Label className="text-slate-300">Event Visibility</Label>
              <div className="flex gap-4">
                {(['public', 'private', 'selected'] as EventVisibility[]).map((visibility) => (
                  <button
                    key={visibility}
                    type="button"
                    onClick={() => handleChange('visibility', visibility)}
                    className={`flex-1 p-4 rounded-lg border transition-all ${
                      formData.visibility === visibility
                        ? 'border-indigo-500 bg-indigo-500/20'
                        : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
                    }`}
                  >
                    <p className={`font-medium capitalize ${
                      formData.visibility === visibility ? 'text-indigo-400' : 'text-slate-300'
                    }`}>
                      {visibility}
                    </p>
                    <p className="text-slate-500 text-sm mt-1">
                      {visibility === 'public' && 'Visible to all users'}
                      {visibility === 'private' && 'Only visible to you'}
                      {visibility === 'selected' && 'Visible to selected users'}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submit Buttons */}
        <div className="flex items-center justify-end gap-4">
          <Link to="/events">
            <Button variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-800">
              Cancel
            </Button>
          </Link>
          <Button
            type="submit"
            disabled={isUploading}
            className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
          >
            {isUploading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Upload Event
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default UploadEventPage;
