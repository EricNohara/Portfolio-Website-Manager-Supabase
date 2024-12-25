export interface ICourseInput {
    name: string;
    grade: string | null;
}

export interface ICourse extends ICourseInput {
    education_id: number;
    user_id: string;
}