<template>
  <div class="glass-panel p-4 sm:p-6 lg:p-8 animate-reveal max-w-full overflow-hidden">
    <header class="mb-8 sm:mb-10 text-center lg:text-left">
      <h3 class="text-2xl sm:text-3xl font-display font-bold uppercase tracking-tighter italic text-primary leading-none">
        New Client
      </h3>
      <p class="text-text-muted text-[9px] sm:text-[10px] uppercase tracking-[0.2em] mt-2">
        Create your account
      </p>
    </header>

    <div v-if="currentStep <= totalSteps" class="mb-8 px-1">
      <div class="flex justify-between items-center mb-4 relative">
        <div v-for="step in totalSteps" :key="step" class="z-10 flex-1 flex flex-col items-center">
          <div 
            class="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-[10px] sm:text-xs font-bold transition-all duration-500 shadow-sm"
            :class="[
              step < currentStep ? 'bg-primary text-white scale-90' : 
              step === currentStep ? 'bg-secondary text-white ring-4 ring-secondary/20' : 
              'bg-gray-200 text-gray-400'
            ]">
            <i v-if="step < currentStep" class="fas fa-check text-[8px]"></i>
            <span v-else>{{ step }}</span>
          </div>
          <p class="hidden sm:block text-[8px] uppercase tracking-wider mt-2 text-text-muted font-medium">
            {{ getStepLabel(step) }}
          </p>
        </div>
        <div class="absolute top-[14px] sm:top-4 left-0 w-full h-[2px] bg-gray-100 -z-0">
          <div 
            class="h-full bg-primary transition-all duration-500 ease-out" 
            :style="{ width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` }">
          </div>
        </div>
      </div>
    </div>

    <div v-if="currentStep === 1" class="mb-8">
      <!-- <button 
        @click="handleSocialSignup('google')" 
        :disabled="isLoading"
        type="button" 
        class="btn-outline w-full flex items-center justify-center gap-3 border border-border hover:bg-white/5 transition-all py-3.5 px-4 active:scale-[0.98]"
      >
        <i class="fa-brands fa-google text-primary text-sm"></i>
        <span class="text-[10px] sm:text-[11px] uppercase tracking-widest font-bold">Continue with Google</span>
      </button>

      <div class="relative my-10 text-center">
        <hr class="border-border" />
        <span class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#0f1115] px-4 text-[9px] text-text-muted uppercase tracking-widest font-bold">
          OR
        </span>
      </div> -->
    </div>

    <form @submit.prevent="handleNext" class="space-y-6">
      <div v-if="currentStep === 1" class="animate-fade-in">
        <h4 class="text-xs sm:text-sm font-bold text-primary mb-5 uppercase tracking-wider">Personal Information</h4>
        <div v-for="field in step1Fields" :key="field.id" class="mb-5">
          <label class="text-[9px] font-bold uppercase tracking-widest text-text-muted mb-2.5 block">
            {{ field.label }}
          </label>
          <input 
            v-model="form[field.id]"
            :type="field.type"
            class="glass-input input-field w-full min-h-[48px] px-4 text-sm"
            :placeholder="field.placeholder"
            :readonly="field.id === 'location' && detectingLocation"
          />
          <p v-if="errors[field.id]" class="text-danger text-[9px] mt-1.5 font-bold animate-pulse">{{ errors[field.id] }}</p>
        </div>

        <button type="button" @click="detectLocation" class="text-[10px] text-secondary mb-4 py-2 flex items-center font-bold uppercase tracking-wide" :disabled="detectingLocation">
          <i class="fas fa-location-dot mr-2"></i> {{ detectingLocation ? 'Detecting...' : 'Auto-detect location' }}
        </button>
      </div>

      <div v-if="currentStep === 2" class="animate-fade-in">
        <h4 class="text-xs sm:text-sm font-bold text-primary mb-5 uppercase tracking-wider">Clinical Information</h4>
        <div v-for="field in step2Fields" :key="field.id" class="mb-5">
          <label class="text-[9px] font-bold uppercase tracking-widest text-text-muted mb-2.5 block">
            {{ field.label }}
          </label>
          <input 
            v-if="field.type !== 'checkbox'"
            v-model="form[field.id]"
            :type="field.type"
            class="glass-input input-field w-full min-h-[48px] px-4 text-sm"
            :placeholder="field.placeholder"
          />
          <div v-else class="flex items-center gap-3 p-1">
            <input type="checkbox" v-model="form[field.id]" class="w-5 h-5 accent-primary rounded border-gray-300">
            <span class="text-[11px] text-text-muted font-medium">{{ field.label }}</span>
          </div>
          <p v-if="errors[field.id]" class="text-danger text-[9px] mt-1.5 font-bold">{{ errors[field.id] }}</p>
        </div>
      </div>

      <div v-if="currentStep === 3" class="animate-fade-in">
        <h4 class="text-xs sm:text-sm font-bold text-primary mb-5 uppercase tracking-wider">Emergency Contact</h4>
        <div v-for="field in step3Fields" :key="field.id" class="mb-5">
          <label class="text-[9px] font-bold uppercase tracking-widest text-text-muted mb-2.5 block">
            {{ field.label }}
          </label>
          <input 
            v-model="form[field.id]"
            :type="field.type"
            class="glass-input input-field w-full min-h-[48px] px-4 text-sm"
            :placeholder="field.placeholder"
          />
          <p v-if="errors[field.id]" class="text-danger text-[9px] mt-1.5 font-bold">{{ errors[field.id] }}</p>
        </div>
      </div>

      <div v-if="currentStep === 4" class="animate-fade-in">
        <h4 class="text-xs sm:text-sm font-bold text-primary mb-5 uppercase tracking-wider">Security & Consent</h4>
        
        <div v-for="field in step4Fields" :key="field.id" class="mb-5">
          <label class="text-[9px] font-bold uppercase tracking-widest text-text-muted mb-2.5 block">
            {{ field.label }}
          </label>
          <input 
            v-model="form[field.id]"
            :type="field.type"
            class="glass-input input-field w-full min-h-[48px] px-4 text-sm"
            :placeholder="field.placeholder"
          />
          <p v-if="errors[field.id]" class="text-danger text-[9px] mt-1.5 font-bold">{{ errors[field.id] }}</p>
        </div>

        <div class="space-y-4 pt-4">
          <div v-for="consent in [
            { id: 'consentToTreatment', text: 'I consent to receive online counselling services.', modal: 'treatment' },
            { id: 'confidentialityAgreement', text: 'I understand confidentiality limits.', modal: 'confidentiality' },
            { id: 'riskAcknowledgement', text: 'I understand this platform is not for emergencies.', modal: 'emergency' },
            { id: 'terms', text: 'I accept the terms and conditions.', modal: 'terms' }
          ]" :key="consent.id">
            <label class="flex items-start gap-3 cursor-pointer group">
              <input type="checkbox" v-model="form[consent.id]" class="mt-0.5 w-5 h-5 accent-primary flex-shrink-0">
              <span class="text-[10px] leading-relaxed uppercase tracking-[0.15em] text-text-muted group-hover:text-text transition-colors">
                {{ consent.text }}
                <button type="button" @click.stop="openModal(consent.modal)" class="text-secondary underline ml-1 font-bold inline-block py-1 px-2 -m-1">View</button>
              </span>
            </label>
            <p v-if="errors[consent.id]" class="text-danger text-[9px] mt-1.5 font-bold">{{ errors[consent.id] }}</p>
          </div>
        </div>
      </div>

      <div class="flex flex-col sm:flex-row gap-3 pt-6">
        <button 
          v-if="currentStep > 1" 
          type="button" 
          @click="previousStep"
          class="order-2 sm:order-1 flex-1 py-4 border border-border text-text-muted rounded-full text-[10px] uppercase tracking-widest font-bold hover:bg-white/5 active:bg-white/10 transition-all"
        >
          Back
        </button>
        <button 
          type="submit" 
          :disabled="isLoading"
          class="order-1 sm:order-2 flex-1 py-4 bg-primary text-white rounded-full text-[10px] uppercase tracking-widest font-bold hover:bg-secondary active:scale-[0.97] transition-all shadow-lg shadow-primary/10"
        >
          <span v-if="isLoading"><i class="fa fa-spinner fa-spin mr-2"></i> Processing...</span>
          <span v-else>{{ currentStep === totalSteps ? 'Complete Registration' : 'Continue' }}</span>
        </button>
      </div>
    </form>

    <div v-if="showModal" 
      class="fixed inset-0 bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center z-[100] p-0 sm:p-4" 
      @click.self="closeModal">
  
      <div class="bg-[#0f1115] w-full h-[92vh] sm:h-auto sm:max-h-[85vh] sm:max-w-lg sm:rounded-3xl flex flex-col border-t sm:border border-border animate-slide-up sm:animate-reveal">
        
        <div class="p-5 sm:p-6 border-b border-border flex justify-between items-center sticky top-0 bg-[#0f1115] z-10">
          <div>
            <h3 class="font-bold text-primary uppercase tracking-tighter text-base">{{ modalTitle }}</h3>
            <p class="text-[8px] text-text-muted uppercase tracking-[0.2em] mt-1">Nangura Registry Agreement</p>
          </div>
          <button @click="closeModal" class="h-10 w-10 flex items-center justify-center rounded-full bg-white/5 text-text-muted hover:text-white transition-colors">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <div class="p-6 overflow-y-auto flex-1 text-[13px] sm:text-sm text-text-muted space-y-6 leading-relaxed">
          <div v-if="modalType === 'treatment'">
            <h4 class="font-bold text-primary mb-3">Consent to Treatment</h4>
            <p>By checking this box, you acknowledge and agree to the following:</p>
            <ul class="list-disc pl-5 mt-4 space-y-4">
              <li>Voluntary seeking of online counselling services.</li>
              <li>Understanding of benefits and limitations.</li>
              <li>Active participation in the process.</li>
            </ul>
          </div>
          <div v-if="modalType === 'emergency'">
            <div class="bg-danger/10 border border-danger/20 p-5 rounded-2xl mb-4 text-center">
                <h4 class="font-bold text-danger text-lg uppercase tracking-tighter">Emergency Protocol</h4>
                <p class="text-[10px] font-bold text-danger/80">NOT FOR CRISIS INTERVENTION</p>
            </div>
            <div class="grid grid-cols-1 gap-4 mt-4">
                <div class="p-4 bg-white/5 rounded-xl border border-border">
                    <p class="text-[9px] uppercase font-bold text-text-muted">Namibia Emergency</p>
                    <p class="text-secondary font-bold text-xl">112 or 10111</p>
                </div>
                <div class="p-4 bg-white/5 rounded-xl border border-border">
                    <p class="text-[9px] uppercase font-bold text-text-muted">Lifeline Crisis Line</p>
                    <p class="text-secondary font-bold text-xl">061 232 221</p>
                </div>
            </div>
          </div>
          </div>

        <div class="p-5 sm:p-6 border-t border-border bg-[#0f1115] sticky bottom-0">
          <button @click="closeModal" class="w-full py-4 bg-primary text-white rounded-full text-[10px] uppercase tracking-widest font-bold shadow-lg shadow-primary/20 active:scale-95 transition-all">
            Accept and Close
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Mobile optimization: Prevents text zooming on inputs in iOS */
input {
  font-size: 16px !important; 
}
@media (min-width: 640px) {
  input {
    font-size: 14px !important;
  }
}

.animate-fade-in {
  animation: fadeIn 0.4s ease-out forwards;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.animate-slide-up {
  animation: slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes slideUp {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}
</style>

<script setup>
  import { ref, reactive, onMounted, computed } from 'vue';
  import { useAuthStore } from './stores/auth-store';
  import { useRouter, useRoute } from 'vue-router';
  import { toast } from 'vue-sonner';
  import { z } from 'zod';

  const store = useAuthStore();
  const router = useRouter(); 
  const route = useRoute();
  
  // State Management
  const currentStep = ref(1);
  const totalSteps = 4;
  const isLoading = ref(false);
  const detectingLocation = ref(false);
  const errors = ref({});
  
  // Modal State
  const showModal = ref(false);
  const modalType = ref('');
  const modalTitle = computed(() => {
    const titles = {
      treatment: 'Consent to Treatment',
      confidentiality: 'Confidentiality Agreement',
      emergency: 'Emergency Protocol',
      terms: 'Terms and Conditions'
    };
    return titles[modalType.value] || 'Terms and Conditions';
  });

  // Form Fields by Step
  const step1Fields = [
    { id: 'fullName', label: 'Full Legal Name', type: 'text', placeholder: 'John Doe' },
    { id: 'dateOfBirth', label: 'Date of Birth', type: 'date', placeholder: '' },
    { id: 'gender', label: 'Gender', type: 'text', placeholder: 'Male / Female / Other' },
    { id: 'email', label: 'Electronic Mail', type: 'email', placeholder: 'john@example.com' },
    { id: 'phone', label: 'Cell phone', type: 'tel', placeholder: '081 123 4568' },
    { id: 'location', label: 'Location', type: 'text', placeholder: 'City, Country' },
  ];

  const step2Fields = [
    { id: 'primaryConcern', label: 'Primary Concern', type: 'text', placeholder: 'Anxiety, stress, trauma etc.' },
    { id: 'previousTherapy', label: 'Have you had therapy before?', type: 'checkbox' },
    { id: 'currentMedication', label: 'Are you currently on any medication?', type: 'checkbox' },
  ];

  const step3Fields = [
    { id: 'emergencyContactName', label: 'Emergency Contact Name', type: 'text', placeholder: 'Jane Doe' },
    { id: 'emergencyContactPhone', label: 'Emergency Contact Phone', type: 'tel', placeholder: '081 000 0000' },
  ];

  const step4Fields = [
    { id: 'password', label: 'Create Password', type: 'password', placeholder: '••••••••' },
    { id: 'Confirmpassword', label: 'Confirm Password', type: 'password', placeholder: '••••••••' },
  ];

  // Form Data
  const form = reactive({ 
    // Step 1
    fullName: '', 
    dateOfBirth: '',
    gender: '',
    email: '', 
    phone: '',
    location: '',
    
    // Step 2
    primaryConcern: '',
    previousTherapy: false,
    currentMedication: false,
    
    // Step 3
    emergencyContactName: '',
    emergencyContactPhone: '',
    
    // Step 4
    password: '', 
    Confirmpassword: '',
    
    // Consent Checkboxes
    consentToTreatment: false,
    confidentialityAgreement: false,
    riskAcknowledgement: false,
    terms: false 
  });

  // Validation Schemas by Step
  const step1Schema = z.object({
    fullName: z.string().min(3, "Full name required"),
    dateOfBirth: z.string().min(1, "Date of birth required"),
    gender: z.string().min(1, "Gender required"),
    email: z.string().email("Valid email required"),
    phone: z.string().min(8, "Valid phone number required"),
    location: z.string().min(3, "Location is required"),
  });

  const step2Schema = z.object({
    primaryConcern: z.string().min(3, "Please state your primary concern"),
  });

  const step3Schema = z.object({
    emergencyContactName: z.string().min(3, "Emergency contact required"),
    emergencyContactPhone: z.string().min(8, "Valid emergency contact required"),
  });

  const step4Schema = z.object({
    password: z.string().min(8, "Password must be 8+ characters"),
    Confirmpassword: z.string(),
    consentToTreatment: z.literal(true, { errorMap: () => ({ message: "Treatment consent required" }) }),
    confidentialityAgreement: z.literal(true, { errorMap: () => ({ message: "Confidentiality agreement required" }) }),
    riskAcknowledgement: z.literal(true, { errorMap: () => ({ message: "Emergency clause must be acknowledged" }) }),
    terms: z.literal(true, { errorMap: () => ({ message: "Terms must be accepted" }) })
  }).refine((data) => data.password === data.Confirmpassword, {
    message: "Passwords do not match",
    path: ["Confirmpassword"], 
  });

  // Helper Functions
  const getStepLabel = (step) => {
    const labels = ['Personal', 'Clinical', 'Emergency', 'Security'];
    return labels[step - 1];
  };

  const openModal = (type) => {
    modalType.value = type;
    showModal.value = true;
  };

  const closeModal = () => {
    showModal.value = false;
    modalType.value = '';
  };

  // Auto-Location Detection
  const detectLocation = async () => {
    detectingLocation.value = true;
    try {
      const response = await fetch('https://ipapi.co/json/');
      const data = await response.json();
      if (data.city && data.country_name) {
        form.location = `${data.city}, ${data.country_name}`;
      }
    } catch (err) {
      form.location = "Windhoek, Namibia";
    } finally {
      detectingLocation.value = false;
    }
  };

  // Navigation
  const handleNext = async () => {
    errors.value = {};
    
    // Validate current step
    let validation;
    switch(currentStep.value) {
      case 1:
        validation = step1Schema.safeParse(form);
        break;
      case 2:
        validation = step2Schema.safeParse(form);
        break;
      case 3:
        validation = step3Schema.safeParse(form);
        break;
      case 4:
        validation = step4Schema.safeParse(form);
        break;
    }

    if (!validation.success) {
      validation.error.issues.forEach(i => errors.value[i.path[0]] = i.message);
      return;
    }

    if (currentStep.value < totalSteps) {
      currentStep.value++;
    } else {
      await handleRegister();
    }
  };

  const previousStep = () => {
    if (currentStep.value > 1) {
      currentStep.value--;
      errors.value = {};
    }
  };

  // Social Signup
  const handleSocialSignup = async (provider) => {
    try {
      isLoading.value = true;
      await store.loginWithSocial(provider);
      toast.success("Identity Verified", { description: "Authenticated successfully via social provider." });
      router.push('/my');
    } catch (err) {
      toast.error("Authentication Failed", { description: err.message });
    } finally {
      isLoading.value = false;
    }
  };

  // Registration
  const finalizeRedirect = () => {
    const destination = route.query.redirect || '/my';
    router.push(destination);
  };

  const handleRegister = async () => {
    try {
      isLoading.value = true;
      
      await store.signUp(form.email, form.password, { 
        fullName: form.fullName,
        dateOfBirth: form.dateOfBirth,
        gender: form.gender,
        phone: form.phone,
        location: form.location,

        emergencyContact: {
          name: form.emergencyContactName,
          phone: form.emergencyContactPhone
        },

        clinical: {
          primaryConcern: form.primaryConcern,
          previousTherapy: form.previousTherapy,
          currentMedication: form.currentMedication
        },

        legal: {
          consentToTreatment: true,
          confidentialityAgreement: true,
          riskAcknowledgement: true,
          termsAccepted: true
        },

        role: 'user',
        accountStatus: 'active',
        createdAt: new Date()
      });
      
      toast.success("Registry Entry Created", { description: "Verify your email to begin." });
      finalizeRedirect();
    } catch (err) {
      toast.error("Registration Failed", { description: err.message });
    } finally {
      isLoading.value = false;
    }
  };

  onMounted(() => {
    detectLocation();
  });
</script>

<style scoped>
/* Add any additional styles here if needed */
</style>