from enum import Enum, unique


@unique
class IDXPrefix(Enum):
    tenant_client = "CL"
    tenant_domain = "DO"

    user_user = "US"

    institute_institute = "IN"

    employee_employee = "EM"
    employee_employeefamily = "EF"
    employee_careerstep = "EC"

    course_course = "CO"
    course_courseclass = "CC"
    course_courseinstructor = "CI"
    course_term = "TE"

    student_student = "ST"
    student_studentstatus = "SS"
    student_custodian = "SC"


    @classmethod
    def get(cls, key):
        enum_obj = getattr(cls, key, None)
        return enum_obj.value
