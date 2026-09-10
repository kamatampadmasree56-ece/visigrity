import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type {
  Dataset, Model, Inference, SecurityEvent, AuditLog,
  Contributor, Report, PipelineStatus
} from '../types';
import {
  initialDatasets, initialModels, initialInferences,
  initialSecurityEvents, initialAuditLogs, initialContributors,
  initialPipelineStatus, DEMO_HASHES
} from '../data/demoData';
import {
  datasetService,
  modelService,
  inferenceService,
  integrityService,
  securityService,
  auditService,
  contributorService,
  reportService
} from '../services';

interface AppContextType {
  // State
  datasets: Dataset[];
  models: Model[];
  inferences: Inference[];
  securityEvents: SecurityEvent[];
  auditLogs: AuditLog[];
  contributors: Contributor[];
  reports: Report[];
  pipelineStatus: PipelineStatus;
  isVerifyingPipeline: boolean;
  isBackendConnected: boolean;

  // Actions
  refreshAll: () => Promise<void>;
  registerDataset: (d: Omit<Dataset, 'id' | 'hash' | 'timestamp' | 'status'> & { hash?: string }) => Promise<Dataset>;
  uploadDatasetFile: (name: string, description: string, version: string, file: File) => Promise<Dataset>;
  verifyDataset: (id: string) => Promise<boolean>;

  registerModel: (m: Omit<Model, 'id' | 'hash' | 'timestamp' | 'status'> & { hash?: string }) => Promise<Model>;
  uploadModelFile: (name: string, description: string, version: string, framework: string, trainingDatasetId: string, file: File) => Promise<Model>;
  verifyModel: (id: string) => Promise<boolean>;

  runInference: (modelId: string, imageFile?: File) => Promise<Inference>;

  verifyPipeline: () => Promise<void>;

  simulateDatasetTampering: () => Promise<void>;
  simulateModelTampering: () => Promise<void>;
  simulateOutputTampering: () => Promise<void>;
  resetAttackSimulation: () => Promise<void>;

  generateReport: (assetId?: string) => Promise<Report>;
  addAuditLog: (log: Omit<AuditLog, 'id' | 'timestamp' | 'transactionReference'>) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [datasets, setDatasets] = useState<Dataset[]>(initialDatasets);
  const [models, setModels] = useState<Model[]>(initialModels);
  const [inferences, setInferences] = useState<Inference[]>(initialInferences);
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>(initialSecurityEvents);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(initialAuditLogs);
  const [contributors, setContributors] = useState<Contributor[]>(initialContributors);
  const [reports, setReports] = useState<Report[]>([]);
  const [pipelineStatus, setPipelineStatus] = useState<PipelineStatus>(initialPipelineStatus);
  const [isVerifyingPipeline, setIsVerifyingPipeline] = useState(false);
  const [isBackendConnected, setIsBackendConnected] = useState(false);

  const refreshAll = useCallback(async () => {
    try {
      const [
        dsData,
        modelsData,
        infsData,
        eventsData,
        logsData,
        contribsData,
        reportsData,
        statusData
      ] = await Promise.all([
        datasetService.getDatasets(),
        modelService.getModels(),
        inferenceService.getInferences(),
        securityService.getEvents(),
        auditService.getLogs(),
        contributorService.getContributors(),
        reportService.getReports(),
        integrityService.getPipelineStatus()
      ]);

      if (dsData.length > 0) setDatasets(dsData);
      if (modelsData.length > 0) setModels(modelsData);
      if (infsData.length > 0) setInferences(infsData);
      if (eventsData.length > 0) setSecurityEvents(eventsData);
      if (logsData.length > 0) setAuditLogs(logsData);
      if (contribsData.length > 0) setContributors(contribsData);
      if (reportsData.length > 0) setReports(reportsData);
      setPipelineStatus(statusData);
      setIsBackendConnected(true);
    } catch {
      // Offline fallback to initial state
      setIsBackendConnected(false);
    }
  }, []);

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  const addAuditLog = useCallback(async (log: Omit<AuditLog, 'id' | 'timestamp' | 'transactionReference'>) => {
    try {
      const newLog = await auditService.createLog(log);
      setAuditLogs(prev => [newLog, ...prev]);
    } catch {
      const fallbackLog: AuditLog = {
        ...log,
        id: `AUDIT-${Date.now()}`,
        timestamp: new Date().toISOString(),
        transactionReference: `DEMO-AUDIT-${Date.now()}`,
        isDemo: true,
      };
      setAuditLogs(prev => [fallbackLog, ...prev]);
    }
  }, []);

  const registerDataset = useCallback(async (d: Omit<Dataset, 'id' | 'hash' | 'timestamp' | 'status'> & { hash?: string }): Promise<Dataset> => {
    try {
      const newDataset = await datasetService.createDataset(d);
      setDatasets(prev => [newDataset, ...prev.filter(item => item.id !== newDataset.id)]);
      const logs = await auditService.getLogs();
      if (logs.length > 0) setAuditLogs(logs);
      return newDataset;
    } catch {
      const id = `DATASET-${Date.now()}`;
      const fallbackDataset: Dataset = {
        ...d,
        id,
        hash: d.hash || DEMO_HASHES.dataset,
        timestamp: new Date().toISOString(),
        status: 'TRUSTED',
      };
      setDatasets(prev => [fallbackDataset, ...prev]);
      addAuditLog({
        recordType: 'DATA_REGISTERED',
        assetId: id,
        hash: fallbackDataset.hash,
        version: fallbackDataset.version,
        contributorName: fallbackDataset.contributorName,
        status: 'VERIFIED',
      });
      return fallbackDataset;
    }
  }, [addAuditLog]);

  const uploadDatasetFile = useCallback(async (name: string, description: string, version: string, file: File): Promise<Dataset> => {
    try {
      const newDataset = await datasetService.uploadDatasetFile(name, description, version, file);
      setDatasets(prev => [newDataset, ...prev.filter(item => item.id !== newDataset.id)]);
      const logs = await auditService.getLogs();
      if (logs.length > 0) setAuditLogs(logs);
      return newDataset;
    } catch {
      return registerDataset({ name, description, version, contributorId: 'usr-demo-001', contributorName: 'Demo Validator' });
    }
  }, [registerDataset]);

  const verifyDataset = useCallback(async (id: string): Promise<boolean> => {
    try {
      const verified = await datasetService.verifyDataset(id);
      setDatasets(prev => prev.map(d => d.id === id ? verified : d));
      return verified.status === 'TRUSTED';
    } catch {
      setDatasets(prev => prev.map(d => d.id === id ? { ...d, status: 'TRUSTED' } : d));
      return true;
    }
  }, []);

  const registerModel = useCallback(async (m: Omit<Model, 'id' | 'hash' | 'timestamp' | 'status'> & { hash?: string }): Promise<Model> => {
    try {
      const newModel = await modelService.createModel(m);
      setModels(prev => [newModel, ...prev.filter(item => item.id !== newModel.id)]);
      const logs = await auditService.getLogs();
      if (logs.length > 0) setAuditLogs(logs);
      return newModel;
    } catch {
      const id = `MODEL-${Date.now()}`;
      const fallbackModel: Model = {
        ...m,
        id,
        hash: m.hash || DEMO_HASHES.model,
        timestamp: new Date().toISOString(),
        status: 'TRUSTED',
      };
      setModels(prev => [fallbackModel, ...prev]);
      addAuditLog({
        recordType: 'MODEL_REGISTERED',
        assetId: id,
        hash: fallbackModel.hash,
        version: fallbackModel.version,
        contributorName: fallbackModel.contributorName,
        status: 'VERIFIED',
      });
      return fallbackModel;
    }
  }, [addAuditLog]);

  const uploadModelFile = useCallback(async (
    name: string,
    description: string,
    version: string,
    framework: string,
    trainingDatasetId: string,
    file: File
  ): Promise<Model> => {
    try {
      const newModel = await modelService.uploadModelFile(name, description, version, framework, trainingDatasetId, file);
      setModels(prev => [newModel, ...prev.filter(item => item.id !== newModel.id)]);
      const logs = await auditService.getLogs();
      if (logs.length > 0) setAuditLogs(logs);
      return newModel;
    } catch {
      return registerModel({ name, description, version, framework, trainingDatasetId, contributorId: 'usr-demo-002', contributorName: 'Alex Chen' });
    }
  }, [registerModel]);

  const verifyModel = useCallback(async (id: string): Promise<boolean> => {
    try {
      const verified = await modelService.verifyModel(id);
      setModels(prev => prev.map(m => m.id === id ? verified : m));
      return verified.status === 'TRUSTED';
    } catch {
      setModels(prev => prev.map(m => m.id === id ? { ...m, status: 'TRUSTED' } : m));
      return true;
    }
  }, []);

  const runInference = useCallback(async (modelId: string, imageFile?: File): Promise<Inference> => {
    try {
      let newInf: Inference;
      if (imageFile) {
        newInf = await inferenceService.runInferenceWithFile(modelId, imageFile);
      } else {
        newInf = await inferenceService.runInference(modelId);
      }
      setInferences(prev => [newInf, ...prev.filter(i => i.id !== newInf.id)]);
      const logs = await auditService.getLogs();
      if (logs.length > 0) setAuditLogs(logs);
      return newInf;
    } catch {
      const id = `INF-${Date.now()}`;
      const model = models.find(m => m.id === modelId) || models[0];
      const fallbackInf: Inference = {
        id,
        modelId: model.id,
        modelName: model.name,
        modelVersion: model.version,
        inputHash: DEMO_HASHES.inferenceInput,
        modelHash: model.hash,
        outputHash: DEMO_HASHES.inferenceOutput,
        result: {
          label: 'Vehicle',
          confidence: 94.2,
          boundingBox: { x: 20, y: 30, w: 55, h: 35 },
        },
        contributorId: 'usr-demo-001',
        contributorName: 'Demo Validator',
        timestamp: new Date().toISOString(),
        status: model.status === 'TRUSTED' ? 'TRUSTED' : 'COMPROMISED',
        isDemo: true,
      };
      setInferences(prev => [fallbackInf, ...prev]);
      addAuditLog({
        recordType: 'INFERENCE_CREATED',
        assetId: id,
        hash: fallbackInf.outputHash,
        version: 'v1.0',
        contributorName: 'Demo Validator',
        status: model.status === 'TRUSTED' ? 'VERIFIED' : 'FAILED',
      });
      return fallbackInf;
    }
  }, [models, addAuditLog]);

  const verifyPipeline = useCallback(async () => {
    setIsVerifyingPipeline(true);
    try {
      const result = await integrityService.verifyPipeline();
      const newStages = {
        DATA: (result.stages.data === 'MATCH' ? 'TRUSTED' : 'COMPROMISED') as Dataset['status'],
        MODEL: (result.stages.model === 'MATCH' ? 'TRUSTED' : 'COMPROMISED') as Dataset['status'],
        INFERENCE: (result.stages.inference === 'MATCH' ? 'TRUSTED' : 'COMPROMISED') as Dataset['status'],
        OUTPUT: (result.stages.output === 'MATCH' ? 'TRUSTED' : 'COMPROMISED') as Dataset['status'],
      };
      setPipelineStatus({ overall: result.status as Dataset['status'], stages: newStages });
    } catch {
      const compromisedModel = models.find(m => m.status === 'COMPROMISED');
      const compromisedDataset = datasets.find(d => d.status === 'COMPROMISED');
      const newStages = {
        DATA: (compromisedDataset ? 'COMPROMISED' : 'TRUSTED') as Dataset['status'],
        MODEL: (compromisedModel ? 'COMPROMISED' : 'TRUSTED') as Dataset['status'],
        INFERENCE: (compromisedModel || compromisedDataset ? 'COMPROMISED' : 'TRUSTED') as Dataset['status'],
        OUTPUT: (compromisedModel || compromisedDataset ? 'COMPROMISED' : 'TRUSTED') as Dataset['status'],
      };
      const overall = Object.values(newStages).some(s => s === 'COMPROMISED') ? 'COMPROMISED' : 'TRUSTED';
      setPipelineStatus({ overall, stages: newStages });
    } finally {
      setIsVerifyingPipeline(false);
    }
  }, [models, datasets]);

  const simulateDatasetTampering = useCallback(async () => {
    try {
      const res = await securityService.simulateDatasetTampering();
      setSecurityEvents(prev => [res.event, ...prev]);
      await refreshAll();
    } catch {
      setDatasets(prev => prev.map(d => d.id === 'UAV-DEMO-DATA-001' ? { ...d, status: 'COMPROMISED' } : d));
      setPipelineStatus({
        overall: 'COMPROMISED',
        stages: { DATA: 'COMPROMISED', MODEL: 'TRUSTED', INFERENCE: 'COMPROMISED', OUTPUT: 'COMPROMISED' },
      });
    }
  }, [refreshAll]);

  const simulateModelTampering = useCallback(async () => {
    try {
      const res = await securityService.simulateModelTampering();
      setSecurityEvents(prev => [res.event, ...prev]);
      await refreshAll();
    } catch {
      setModels(prev => prev.map(m => m.id === 'VISI-YOLO-DEMO' ? { ...m, status: 'COMPROMISED' } : m));
      setPipelineStatus({
        overall: 'COMPROMISED',
        stages: { DATA: 'TRUSTED', MODEL: 'COMPROMISED', INFERENCE: 'COMPROMISED', OUTPUT: 'COMPROMISED' },
      });
    }
  }, [refreshAll]);

  const simulateOutputTampering = useCallback(async () => {
    try {
      const res = await securityService.simulateOutputTampering();
      setSecurityEvents(prev => [res.event, ...prev]);
      await refreshAll();
    } catch {
      setInferences(prev => prev.map(inf => inf.id === 'INF-DEMO-001' ? { ...inf, status: 'COMPROMISED' } : inf));
      setPipelineStatus({
        overall: 'COMPROMISED',
        stages: { DATA: 'TRUSTED', MODEL: 'TRUSTED', INFERENCE: 'TRUSTED', OUTPUT: 'COMPROMISED' },
      });
    }
  }, [refreshAll]);

  const resetAttackSimulation = useCallback(async () => {
    try {
      await securityService.resetDemo();
      await refreshAll();
    } catch {
      setDatasets(initialDatasets);
      setModels(initialModels);
      setSecurityEvents(initialSecurityEvents);
      setPipelineStatus(initialPipelineStatus);
    }
  }, [refreshAll]);

  const generateReport = useCallback(async (assetId?: string): Promise<Report> => {
    try {
      const report = await reportService.createReport(assetId);
      setReports(prev => [report, ...prev]);
      const logs = await auditService.getLogs();
      if (logs.length > 0) setAuditLogs(logs);
      return report;
    } catch {
      const report: Report = {
        id: `RPT-${Date.now()}`,
        assetId: assetId || 'PIPELINE',
        integrityStatus: pipelineStatus.overall,
        generatedDate: new Date().toISOString(),
        contributorName: 'Demo Validator',
        blockchainReference: `DEMO-RPT-${Date.now()}`,
      };
      setReports(prev => [report, ...prev]);
      return report;
    }
  }, [pipelineStatus.overall]);

  return (
    <AppContext.Provider value={{
      datasets, models, inferences, securityEvents, auditLogs,
      contributors, reports, pipelineStatus, isVerifyingPipeline,
      isBackendConnected,
      refreshAll,
      registerDataset, uploadDatasetFile, verifyDataset,
      registerModel, uploadModelFile, verifyModel,
      runInference,
      verifyPipeline,
      simulateDatasetTampering, simulateModelTampering, simulateOutputTampering, resetAttackSimulation,
      generateReport,
      addAuditLog,
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
