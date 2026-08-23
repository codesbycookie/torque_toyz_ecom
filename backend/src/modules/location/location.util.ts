import { enhanceDoc } from '@core/constants/enhancedoc.constant.ts';
import LocationModel, { ILocation } from '@db/models/location.model.ts';

export const enhanceLocation = (location: ILocation) => {
  return enhanceDoc(LocationModel, location, []);
};