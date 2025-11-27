from flask import request, jsonify

def paginate_query(query, page=None, per_page=None):
    """Paginate a SQLAlchemy query"""
    page = page or request.args.get('page', 1, type=int)
    per_page = per_page or request.args.get('limit', 10, type=int)
    
    # Limit per_page to prevent abuse
    per_page = min(per_page, 100)
    
    pagination = query.paginate(
        page=page,
        per_page=per_page,
        error_out=False
    )
    
    return {
        'items': [item.to_dict() for item in pagination.items],
        'pagination': {
            'page': page,
            'per_page': per_page,
            'total': pagination.total,
            'pages': pagination.pages,
            'has_next': pagination.has_next,
            'has_prev': pagination.has_prev
        }
    }