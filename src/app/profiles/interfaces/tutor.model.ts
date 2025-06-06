import {Review} from "./review.model";
import {Genre, Instrument} from "../../components/search-bar/search-bar.component";
import {TuitionRegion} from "./tuition-region.model";
import {Image} from "./image.model";
import {Price} from "./price";
import {InstrumentQualification, Qualification} from "../../components/shared-data-service.component";

export interface TutorProfile {
  id: number;
  displayName: string;
  bio: string;
  profileType: string;
  appUserId: number;
  profilePicture: Image;
  qualifications: Qualification[];
  instrumentQuals: InstrumentQualification[];
  instruments: Instrument[];
  lessonType: string;
  enrolledStudents: number;
  reviews: Review[];
  prices: Price[];
  genres: Genre[];
  averageRating: number;
  tuitionRegion: TuitionRegion;
}
