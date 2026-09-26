import { Request, Response } from 'express';
import { geographyService } from '../services/geographyService';
import { sendSuccess } from '../utils/responseEnvelope';

export const geographyController = {
  async getStates(_req: Request, res: Response): Promise<Response> {
    const states = await geographyService.getStates();
    return sendSuccess(res, states);
  },

  async getState(req: Request, res: Response): Promise<Response> {
    const state = await geographyService.getState(req.params.id);
    return sendSuccess(res, state);
  },

  async getDistricts(req: Request, res: Response): Promise<Response> {
    const stateId = req.query.stateId as string | undefined;
    const page = req.query.page as any;
    const limit = req.query.limit as any;
    const result = await geographyService.getDistricts(stateId, page, limit);
    return sendSuccess(res, result.districts, result.meta);
  },

  async getDistrict(req: Request, res: Response): Promise<Response> {
    const district = await geographyService.getDistrict(req.params.id);
    return sendSuccess(res, district);
  },

  async getBlocks(req: Request, res: Response): Promise<Response> {
    const districtId = req.query.districtId as string | undefined;
    const page = req.query.page as any;
    const limit = req.query.limit as any;
    const result = await geographyService.getBlocks(districtId, page, limit);
    return sendSuccess(res, result.blocks, result.meta);
  },

  async getBlock(req: Request, res: Response): Promise<Response> {
    const block = await geographyService.getBlock(req.params.id);
    return sendSuccess(res, block);
  },

  async getPanchayats(req: Request, res: Response): Promise<Response> {
    const blockId = req.query.blockId as string | undefined;
    const page = req.query.page as any;
    const limit = req.query.limit as any;
    const result = await geographyService.getPanchayats(blockId, page, limit);
    return sendSuccess(res, result.panchayats, result.meta);
  },

  async getPanchayat(req: Request, res: Response): Promise<Response> {
    const panchayat = await geographyService.getPanchayat(req.params.id);
    return sendSuccess(res, panchayat);
  },

  async getVillages(req: Request, res: Response): Promise<Response> {
    const panchayatId = req.query.panchayatId as string | undefined;
    const page = req.query.page as any;
    const limit = req.query.limit as any;
    const result = await geographyService.getVillages(panchayatId, page, limit);
    return sendSuccess(res, result.villages, result.meta);
  },

  async getVillage(req: Request, res: Response): Promise<Response> {
    const village = await geographyService.getVillage(req.params.id);
    return sendSuccess(res, village);
  },

  async resolvePoint(req: Request, res: Response): Promise<Response> {
    const lat = parseFloat(req.query.lat as string);
    const lon = parseFloat(req.query.lon as string);
    const result = await geographyService.resolvePoint(lat, lon);
    return sendSuccess(res, result);
  },

  async getHierarchy(req: Request, res: Response): Promise<Response> {
    const result = await geographyService.getHierarchy(req.params.id);
    return sendSuccess(res, result);
  },
};
